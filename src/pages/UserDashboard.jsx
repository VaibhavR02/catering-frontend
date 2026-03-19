import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { api, useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import AppLayout from "../components/AppLayout";

const STATUS_BADGE = {
  ordered:      { label: 'New',          color: '#F59E0B' },
  confirmed:    { label: 'Preparing',    color: '#3B82F6' },
  'on-the-way': { label: 'On the Way',   color: '#8B5CF6' },
  delivered:    { label: 'Delivered',    color: '#10B981' },
  cancelled:    { label: 'Cancelled',    color: '#EF4444' },
}

export default function UserDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch orders ── */
  useEffect(() => { fetchOrders() }, []);

  async function fetchOrders() {
    try {
      const { data } = await api.get("/api/v1/orders/user-orders");
      setOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  }

  /* ── Stats ── */
  const totalOrders  = orders.length;
  const totalItems   = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
  const totalSpent   = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total_amount || 0), 0);
  const delivered    = orders.filter(o => o.status === "delivered").length;

  /* ── Weekly spending chart ── */
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekData = days.map((day) => ({
    d: day,
    amount: orders
      .filter(o =>
        o.status !== 'cancelled' &&
        new Date(o.createdAt).toLocaleDateString("en-US", { weekday: "short" }) === day
      )
      .reduce((s, o) => s + (o.total_amount || 0), 0),
  }));

  if (loading) return <AppLayout>Loading dashboard...</AppLayout>;

  return (
    <AppLayout>

      {/* ── Greeting ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>
          Good morning, {user?.username?.split(" ")[0]} 👋
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {user?.org}{" "}
          {!user?.society
            ? <Link to="/user/profile">Update profile →</Link>
            : <>📍 {user?.society} › {user?.tower} › Floor {user?.floor}</>
          }
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="metrics-grid">
        {[
          { icon: "📦", label: "Total Orders",  value: totalOrders,                               color: "var(--ember)",  bg: "var(--ember-glow)" },
          { icon: "🛍️", label: "Items Ordered", value: totalItems,                                color: "var(--blue)",   bg: "var(--blue-dim)"   },
          { icon: "✅", label: "Delivered",      value: `${delivered}/${totalOrders}`,             color: "var(--green)",  bg: "var(--green-dim)"  },
          { icon: "₹",  label: "Total Spent",   value: `₹${totalSpent.toLocaleString("en-IN")}`,  color: "var(--purple)", bg: "var(--purple-dim)" },
        ].map((m, i) => (
          <div className="metric-card" key={m.label} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="metric-icon" style={{ background: m.bg, color: m.color }}>{m.icon}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-60-40">

        {/* ── LEFT ── */}
        <div>

          {/* Weekly Spending Chart */}
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-title">📈 This Week's Spending</div>
            </div>
            <div className="panel-body">
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={weekData}>
                  <XAxis dataKey="d" />
                  <YAxis />
                  <Tooltip formatter={(v) => [`₹${v}`, "Spent"]} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fillOpacity={0.2}
                    fill="#F59E0B"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Summary by Status */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">📊 Order Summary</div>
            </div>
            <div className="panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {Object.entries(STATUS_BADGE).map(([key, val]) => {
                  const c = orders.filter(o => o.status === key).length
                  if (!c) return null
                  return (
                    <div key={key} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8,
                      background: `${val.color}12`,
                      border: `1px solid ${val.color}30`,
                    }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: val.color, flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>
                        {val.label}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: val.color }}>
                        {c}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT — Recent Orders ── */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Recent Orders</div>
            <button className="btn-ghost" onClick={() => navigate("/user/my-orders")}>
              View all →
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon">📦</div>
              <p>No orders yet</p>
            </div>
          ) : (
            orders.slice(0, 6).map((o) => {
              const badge      = STATUS_BADGE[o.status] || { label: o.status, color: '#888' }
              const itemCount  = o.items.reduce((s, i) => s + i.quantity, 0)
              const itemNames  = o.items.map(i => i.name).join(", ")

              return (
                <div key={o._id} style={{
                  padding: "13px 16px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Date */}
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        weekday: "short", day: "numeric", month: "short",
                      })}
                    </div>

                    {/* Item names */}
                    <div style={{
                      fontSize: 11, color: 'var(--text-muted)', marginTop: 2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {itemCount} item{itemCount !== 1 ? 's' : ''} · {itemNames}
                    </div>

                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>

                    {/* Status badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px',
                      borderRadius: 20, color: '#fff',
                      background: badge.color,
                      display: 'inline-block', marginBottom: 4,
                    }}>
                      {badge.label}
                    </span>

                    {/* Amount */}
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {o.payment_status === "paid"
                        ? `₹${o.total_amount?.toLocaleString("en-IN")}`
                        : <span style={{ color: '#F59E0B' }}>₹{o.total_amount?.toLocaleString("en-IN")} · Unpaid</span>
                      }
                    </div>

                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </AppLayout>
  );
}