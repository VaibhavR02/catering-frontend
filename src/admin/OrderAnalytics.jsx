import { useEffect, useState } from "react";
import "./admin.css";

const API_URL = "http://localhost:5000/api/v1/admin/orders/analytics";

function formatCurrency(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

const STATUS_PILL = {
  delivered: "pill-green",
  confirmed: "pill-blue",
  "on-the-way": "pill-purple",
  pending: "pill-orange",
  cancelled: "pill-red",
};

function StatusPill({ status }) {
  const cls = STATUS_PILL[status] || "pill-muted";
  return <span className={`pill ${cls}`}>{status.replace(/-/g, " ")}</span>;
}

function StatCard({ label, value, sub, tone, icon }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-card-head">
        <div className="stat-icon">{icon}</div>
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

/* ── Donut chart ── */
function StatusDonut({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const colors = [
    "var(--ember)",
    "var(--blue)",
    "var(--green)",
    "var(--purple)",
    "var(--orange)",
    "var(--red)",
  ];
  const radius = 70;
  const stroke = 22;
  const c = 2 * Math.PI * radius;

  let offset = 0;

  const segments = data.map((d, i) => {
    const frac = d.count / total;
    const len = frac * c;

    const seg = (
      <circle
        key={d._id}
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke={colors[i % colors.length]}
        strokeWidth={stroke}
        strokeDasharray={`${len} ${c - len}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 100 100)"
      />
    );

    offset += len;
    return seg;
  });

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 200 200" className="donut-svg">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--bg-overlay)"
          strokeWidth={stroke}
        />
        {segments}
      </svg>

      <div className="donut-center">
        <div className="donut-total">{total}</div>
        <div className="donut-total-label">Orders</div>
      </div>

      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={d._id} className="legend-row">
            <span
              className="legend-dot"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="legend-name">{d._id.replace(/-/g, " ")}</span>
            <span className="legend-val">
              {d.count} ({Math.round((d.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Trend chart ── */
function DailyTrendChart({ data }) {
  if (!data.length) return <div>No trend data</div>;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);

  const W = 600;
  const H = 220;
  const pad = { l: 36, r: 36, t: 16, b: 32 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const barW = Math.min(38, innerW / Math.max(data.length, 1) - 8);

  const linePts = data
    .map((d, i) => {
      const x = data.length === 1 ? pad.l + innerW / 2 : pad.l + i * stepX;
      const y = pad.t + innerH - (d.revenue / maxRev) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`}>
      {data.map((d, i) => {
        const cx = data.length === 1 ? pad.l + innerW / 2 : pad.l + i * stepX;
        const h = (d.count / maxCount) * innerH;

        return (
          <rect
            key={d._id}
            x={cx - barW / 2}
            y={pad.t + innerH - h}
            width={barW}
            height={h}
          />
        );
      })}

      {data.length > 1 && (
        <polyline fill="none" stroke="blue" points={linePts} />
      )}
    </svg>
  );
}

export default function OrdersAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(API_URL, { credentials: "include" });
        const json = await res.json();

        if (cancelled) return;
        if (!json.success) throw new Error("Failed to load analytics");

        setData(json.data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Loading analytics…</div>;
  if (error) return <div>⚠ {error}</div>;
  if (!data) return null;

  const totalOrders = data.byStatus.reduce((s, d) => s + d.count, 0);
  const totalRevenue = data.byVendor.reduce((s, v) => s + v.revenue, 0);
  const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="dashboard">
      <h1>Orders Analytics</h1>

      <StatCard
        tone="ember"
        icon="📦"
        label="Total Orders"
        value={totalOrders}
      />

      <StatCard
        tone="green"
        icon="💰"
        label="Revenue"
        value={formatCurrency(totalRevenue)}
      />

      <DailyTrendChart data={data.dailyTrend} />
      <StatusDonut data={data.byStatus} />
    </div>
  );
}
