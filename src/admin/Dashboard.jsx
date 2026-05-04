import { useEffect, useState } from "react";
import "./admin.css";
import AppLayout from "../components/AppLayout";

const API_URL = "http://localhost:5000/api/v1/admin/dashboard";

function formatCurrency(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-card-head">
        <span className="stat-icon">{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    delivered: "pill-green",
    ordered: "pill-blue",
    confirmed: "pill-purple",
    "on-the-way": "pill-orange",
    cancelled: "pill-red",
    paid: "pill-green",
    pending: "pill-orange",
  };

  return (
    <span className={`pill ${map[status] || "pill-muted"}`}>
      {status.replace(/-/g, " ")}
    </span>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL, { credentials: "include" });
        const json = await res.json();

        if (!active) return;
        if (!json.success) throw new Error("Request failed");

        setData(json.data);
      } catch (e) {
        if (active) setError(e.message || "Error");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dash-loading">Loading dashboard…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard">
        <div className="dash-error">
          Failed to load dashboard{error ? `: ${error}` : ""}
        </div>
      </div>
    );
  }

  const paid = data.revenue.byPaymentStatus.paid || 0;
  const pending = data.revenue.byPaymentStatus.pending || 0;

  return (
    <AppLayout>
      <div className="dashboard">
        <header className="dash-header">
          <div>
            <h1 className="dash-title">
              Admin <em>Dashboard</em>
            </h1>
            <p className="dash-sub">
              Overview of users, vendors, orders, and revenue.
            </p>
          </div>
        </header>

        <section className="stat-grid">
          <StatCard
            label="Total Users"
            value={String(data.users.total)}
            sub={`${data.users.active} active`}
            accent="blue"
            icon="👥"
          />
          <StatCard
            label="Vendors"
            value={String(data.vendors.total)}
            sub={`${data.vendors.active} active`}
            accent="purple"
            icon="🏪"
          />
          <StatCard
            label="Total Orders"
            value={String(data.orders.total)}
            sub={Object.entries(data.orders.byStatus)
              .map(([k, v]) => `${v} ${k}`)
              .join(" · ")}
            accent="ember"
            icon="📦"
          />
          <StatCard
            label="Revenue"
            value={formatCurrency(data.revenue.total)}
            sub={`${paid} paid · ${pending} pending`}
            accent="green"
            icon="💰"
          />
        </section>

        <div className="dash-grid">
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Recent Orders</h2>
              <span className="panel-meta">
                {data.recentOrders.length} latest
              </span>
            </div>

            <div className="orders-table">
              <div className="orders-row orders-head">
                <span>Customer</span>
                <span>Vendor</span>
                <span>Location</span>
                <span>Amount</span>
                <span>Payment</span>
                <span>Status</span>
              </div>

              {data.recentOrders?.map((o) => (
                <div className="orders-row" key={o._id}>
                  <span>
                    <div className="cell-strong">{o.user?.username}</div>
                    <div className="cell-muted">{o.user?.email}</div>
                  </span>

                  <span>
                    <div className="cell-strong">{o.vendor.name}</div>
                    <div className="cell-muted">{formatDate(o.createdAt)}</div>
                  </span>

                  <span>
                    <div className="cell-strong">{o.society.society_name}</div>
                    <div className="cell-muted">
                      Tower {o.society.tower} · Floor {o.society.floor}
                    </div>
                  </span>

                  <span className="cell-strong">
                    {formatCurrency(o.total_amount)}
                  </span>

                  <span>
                    <StatusPill status={o.payment_status} />
                  </span>

                  <span>
                    <StatusPill status={o.status} />
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Top Vendors</h2>
              <span className="panel-meta">By revenue</span>
            </div>

            <div className="vendor-list">
              {data.topVendors.map((v, i) => (
                <div className="vendor-row" key={v._id}>
                  <div className="vendor-rank">#{i + 1}</div>
                  <div className="vendor-info">
                    <div className="cell-strong">{v.vendor.name}</div>
                    <div className="cell-muted">{v.orderCount} orders</div>
                  </div>
                  <div className="vendor-rev">{formatCurrency(v.revenue)}</div>
                </div>
              ))}
            </div>

            <div className="panel-divider" />

            <div className="panel-head">
              <h2 className="panel-title">Order Status</h2>
            </div>

            <div className="status-list">
              {Object.entries(data.orders.byStatus).map(([k, v]) => {
                const pct = data.orders.total
                  ? Math.round((v / data.orders.total) * 100)
                  : 0;

                return (
                  <div className="status-item" key={k}>
                    <div className="status-item-head">
                      <StatusPill status={k} />
                      <span className="cell-strong">
                        {v} <span className="cell-muted">({pct}%)</span>
                      </span>
                    </div>

                    <div className="status-bar">
                      <div
                        className="status-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
