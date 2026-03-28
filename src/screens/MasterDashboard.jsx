import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { MOCK_ORDERS, VENDORS, WEEKLY_DATA } from "../utils/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#F97316"];

export default function MasterDashboard() {
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const totalOrders = orders.length;
  const totalTiffins = orders.reduce((s, o) => s + o.count, 0);
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const paidAmount = orders
    .filter((o) => o.payStatus === "paid")
    .reduce((s, o) => s + o.amount, 0);
  const totalAmount = orders.reduce((s, o) => s + o.amount, 0);

  const deliveryRate = Math.round((delivered / totalOrders) * 100);

  const statusPie = [
    { name: "Delivered", value: delivered },
    { name: "Confirmed", value: confirmed },
    { name: "Pending", value: pending },
  ];

  // Society-wise lunch count
  const societyMap = {};
  orders.forEach((o) => {
    if (!societyMap[o.society])
      societyMap[o.society] = {
        name: o.society.replace(" Society", ""),
        tiffins: 0,
        orders: 0,
      };
    societyMap[o.society].tiffins += o.count;
    societyMap[o.society].orders += 1;
  });
  const societyData = Object.values(societyMap);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: "#1A2130",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 12,
        }}
      >
        <p style={{ color: "#8B96A8", marginBottom: 6 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  };

  return (
    <AppLayout pendingCount={pending}>
      {/* Top KPIs */}
      <div className="metrics-grid">
        {[
          {
            icon: "📦",
            label: "Total Orders",
            value: totalOrders,
            sub: `${pending} pending`,
            color: "var(--ember)",
            bg: "var(--ember-glow)",
            deltaClass: pending > 0 ? "delta-down" : "delta-up",
          },
          {
            icon: "🍱",
            label: "Total Tiffins",
            value: totalTiffins,
            sub: "today",
            color: "var(--blue)",
            bg: "var(--blue-dim)",
            deltaClass: "delta-up",
          },
          {
            icon: "🚀",
            label: "Delivery Rate",
            value: `${deliveryRate}%`,
            sub: `${delivered} delivered`,
            color: "var(--green)",
            bg: "var(--green-dim)",
            deltaClass: "delta-up",
          },
          {
            icon: "₹",
            label: "Collected",
            value: `₹${paidAmount}`,
            sub: `₹${totalAmount - paidAmount} pending`,
            color: "var(--purple)",
            bg: "var(--purple-dim)",
            deltaClass: paidAmount < totalAmount ? "delta-down" : "delta-up",
          },
        ].map((m, i) => (
          <div
            className="metric-card"
            key={m.label}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div
              className="metric-icon"
              style={{ background: m.bg, color: m.color }}
            >
              {m.icon}
            </div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
            <div className={`metric-delta ${m.deltaClass}`}>
              {m.deltaClass === "delta-up" ? "↑" : "↓"}{" "}
              <span className="delta-note">{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-60-40" style={{ marginBottom: 20 }}>
        {/* Weekly bar chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">📈 Weekly Order Trend</div>
              <div className="panel-subtitle">
                Orders & deliveries this week
              </div>
            </div>
          </div>
          <div className="panel-body" style={{ paddingTop: 4 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={WEEKLY_DATA} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#4A5568" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#4A5568" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="orders"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                  name="Orders"
                />
                <Bar
                  dataKey="delivered"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  name="Delivered"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status pie */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🎯 Order Status</div>
          </div>
          <div
            className="panel-body"
            style={{ display: "flex", alignItems: "center", gap: 16 }}
          >
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie
                  data={statusPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPie.map((_, i) => (
                    <Cell key={i} fill={["#10B981", "#3B82F6", "#F59E0B"][i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {statusPie.map((s, i) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: ["#10B981", "#3B82F6", "#F59E0B"][i],
                      }}
                    />
                    <span
                      style={{ fontSize: 12, color: "var(--text-secondary)" }}
                    >
                      {s.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Delivery Rate
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--green)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {deliveryRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Vendor status */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🏪 Vendor Performance</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              <span className="live-dot" /> Live
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Delivered</th>
                <th>Pending</th>
                <th>Revenue</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {VENDORS.map((v) => {
                const total = v.delivered + v.pending + v.confirmed;
                const pct = Math.round((v.delivered / total) * 100);
                return (
                  <tr key={v.id}>
                    <td>
                      <div className="td-primary">{v.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {v.vendorName}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: "var(--green)", fontWeight: 700 }}>
                        {v.delivered}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color:
                            v.pending > 0
                              ? "var(--ember)"
                              : "var(--text-muted)",
                        }}
                      >
                        {v.pending}
                      </span>
                    </td>
                    <td
                      className="td-mono"
                      style={{ color: "var(--text-primary)" }}
                    >
                      ₹{v.revenue}
                    </td>
                    <td style={{ minWidth: 100 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div
                            className="progress-fill green"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-muted)",
                            minWidth: 30,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Society summary */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🏢 Society-wise Count</div>
          </div>
          <div className="panel-body" style={{ paddingTop: 4 }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={societyData} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#4A5568" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 11, fill: "#8B96A8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="tiffins"
                  fill="#F59E0B"
                  radius={[0, 4, 4, 0]}
                  name="Tiffins"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live order feed */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">⚡ Live Order Feed</div>
            <div className="panel-subtitle">
              All orders today · auto-refreshing
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="chip">
              <span className="live-dot" style={{ marginRight: 4 }} />
              Live
            </span>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Society › Tower › Floor › Org</th>
                <th>Tiffins</th>
                <th>Order Status</th>
                <th>Vendor Status</th>
                <th>Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="td-primary">{o.userName}</td>
                  <td>
                    <div className="order-location">
                      <span>{o.society}</span>
                      <span className="sep">›</span>
                      <span>{o.tower}</span>
                      <span className="sep">›</span>
                      <span>F{o.floor}</span>
                      <span className="sep">›</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {o.org}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: "var(--ember)",
                      }}
                    >
                      {o.count}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${o.status}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {o.status === "delivered" ? (
                      <span className="badge badge-delivered">Delivered ✓</span>
                    ) : (
                      <span className="badge badge-pending">In Progress</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${o.payStatus}`}>
                      {o.payStatus}
                    </span>
                  </td>
                  <td
                    className="td-mono"
                    style={{
                      color:
                        o.payStatus === "paid"
                          ? "var(--green)"
                          : "var(--text-secondary)",
                    }}
                  >
                    ₹{o.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
