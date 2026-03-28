// // import { useEffect, useState } from "react"
// // import AppLayout from "../components/AppLayout"
// // import { useAuth } from "../contexts/AuthContext"
// // import { api } from "../contexts/AuthContext"

// // export default function MyOrders() {
// //   const { user } = useAuth()

// //   const [orders, setOrders] = useState([])
// //   const [loading, setLoading] = useState(true)

// //   useEffect(() => {
// //     fetchOrders()
// //   }, [])

// //   async function fetchOrders() {
// //     try {
// //       const { data } = await api.get("/api/v1/orders/user-orders")
// //       setOrders(data.data || [])
// //     } catch (err) {
// //       console.error("Failed to fetch orders", err)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const total = orders.length

// //   const tiffins = orders.reduce(
// //     (sum, order) => sum + (order.tiffin_count || 0),
// //     0
// //   )

// //   return (
// //     <AppLayout>

// //       {/* Stats */}
// //       <div className="metrics-grid">
// //         {[
// //           { icon: "📦", label: "Total Orders", value: total, color: "var(--ember)", bg: "var(--ember-glow)" },
// //           { icon: "🍱", label: "Total Tiffins", value: tiffins, color: "var(--blue)", bg: "var(--blue-dim)" },
// //         ].map((m, i) => (
// //           <div
// //             className="metric-card"
// //             key={m.label}
// //             style={{ animationDelay: `${i * 0.07}s` }}
// //           >
// //             <div className="metric-icon" style={{ background: m.bg, color: m.color }}>
// //               {m.icon}
// //             </div>
// //             <div className="metric-value">{m.value}</div>
// //             <div className="metric-label">{m.label}</div>
// //           </div>
// //         ))}
// //       </div>

// //       {/* Table */}
// //       <div className="panel">
// //         <div className="panel-header">
// //           <div className="panel-title">Order History</div>
// //           <span className="chip">{total} orders</span>
// //         </div>

// //         {loading ? (
// //           <div style={{ padding: 30 }}>Loading orders...</div>
// //         ) : (
// //           <table className="data-table">
// //             <thead>
// //               <tr>
// //                 <th>Date</th>
// //                 <th>Meal</th>
// //                 <th>Tiffins</th>
// //                 <th>Status</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {orders.map(o => (
// //                 <tr key={o._id}>
// //                   <td className="td-mono">
// //                     {new Date(o.createdAt).toLocaleDateString("en-IN", {
// //                       day: "numeric",
// //                       month: "short",
// //                       year: "numeric",
// //                     })}
// //                   </td>

// //                   <td>{o.meal_type}</td>

// //                   <td>
// //                     <span
// //                       style={{
// //                         fontFamily: "var(--font-mono)",
// //                         fontWeight: 700,
// //                         color: "var(--ember)",
// //                         fontSize: 15,
// //                       }}
// //                     >
// //                       {o.tiffin_count}
// //                     </span>
// //                   </td>

// //                   <td>
// //                     <span className={`badge badge-${o.status}`}>
// //                       {o.status}
// //                     </span>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         )}
// //       </div>

// //     </AppLayout>
// //   )
// // }

// import { useEffect, useState } from "react"
// import AppLayout from "../components/AppLayout"
// import { useAuth } from "../contexts/AuthContext"
// import { api } from "../contexts/AuthContext"

// export default function MyOrders() {
//   const { user } = useAuth()

//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetchOrders()
//   }, [])

//   async function fetchOrders() {
//     try {
//       const { data } = await api.get("/api/v1/orders/user-orders")
//       setOrders(data.data || [])
//     } catch (err) {
//       console.error("Failed to fetch orders", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ── Stats Calculations ─────────────────────────────

//   const totalOrders = orders.length

//   const totalTiffins = orders.reduce((sum, order) => {
//     const count =
//       order.items?.reduce((s, item) => s + item.quantity, 0) || 0
//     return sum + count
//   }, 0)

//   const totalSpent = orders.reduce(
//     (sum, order) => sum + (order.total_amount || 0),
//     0
//   )

//   const pendingPayment = orders
//     .filter(o => o.payment_status === "pending")
//     .reduce((sum, o) => sum + (o.total_amount || 0), 0)

//   return (
//     <AppLayout>

//       {/* ── Dashboard Stats ───────────────────────────── */}

//       <div className="metrics-grid">
//         {[
//           { icon: "📦", label: "Total Orders", value: totalOrders, color: "var(--ember)", bg: "var(--ember-glow)" },
//           { icon: "🍱", label: "Total Tiffins", value: totalTiffins, color: "var(--blue)", bg: "var(--blue-dim)" },
//           { icon: "₹", label: "Total Spent", value: `₹${totalSpent}`, color: "var(--green)", bg: "var(--green-dim)" },
//           { icon: "⏳", label: "Pending Payment", value: `₹${pendingPayment}`, color: "var(--red)", bg: "var(--red-dim)" }
//         ].map((m, i) => (
//           <div
//             className="metric-card"
//             key={m.label}
//             style={{ animationDelay: `${i * 0.07}s` }}
//           >
//             <div className="metric-icon" style={{ background: m.bg, color: m.color }}>
//               {m.icon}
//             </div>

//             <div className="metric-value">{m.value}</div>

//             <div className="metric-label">{m.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* ── Orders Table ───────────────────────────── */}

//       <div className="panel">
//         <div className="panel-header">
//           <div className="panel-title">Order History</div>
//           <span className="chip">{totalOrders} orders</span>
//         </div>

//         {loading ? (
//           <div style={{ padding: 30 }}>Loading orders...</div>
//         ) : (
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Sr</th>
//                 <th>Date</th>
//                 <th>Meal</th>
//                 <th>Items</th>
//                 <th>Amount</th>
//                 <th>Status</th>
//                 <th>Payment</th>
//               </tr>
//             </thead>

//             <tbody>
//               {orders.map((o,index) => (
//                 <tr key={o._id}>

//                   {/* Date */}
//                   <td className="td-mono">{index+1}</td>
//                   <td className="td-mono">
//                     {new Date(o.createdAt).toLocaleDateString("en-IN", {
//                       day: "numeric",
//                       month: "short",
//                       year: "numeric",
//                       hour:"2-digit"
//                       ,minute:"2-digit",
//                       second:"2-digit",
//                       hour12:true
//                     })}
//                   </td>

//                   {/* Meal */}
//                   <td>{o.meal_type}</td>

//                   {/* Items */}
//                   <td>
//                     {o.items?.map((item, i) => (
//                       <div key={i}>
//                         {item.quantity} × {item.tiffin_type}
//                       </div>
//                     ))}
//                   </td>

//                   {/* Amount */}
//                   <td className="td-mono">
//                     ₹{o.total_amount || 0}
//                   </td>

//                   {/* Order Status */}
//                   <td>
//                     <span className={`badge badge-${o.status}`}>
//                       {o.status}
//                     </span>
//                   </td>

//                   {/* Payment Status */}
//                   <td>
//                     <span className={`badge badge-${o.payment_status}`}>
//                       {o.payment_status}
//                     </span>
//                   </td>

//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//     </AppLayout>
//   )
// }

import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { api } from "../contexts/AuthContext";

const STATUS_BADGE = {
  ordered: { label: "New", color: "#F59E0B" },
  confirmed: { label: "Preparing", color: "#3B82F6" },
  "on-the-way": { label: "On the Way", color: "#8B5CF6" },
  delivered: { label: "Delivered", color: "#10B981" },
  cancelled: { label: "Cancelled", color: "#EF4444" },
};

const PAYMENT_BADGE = {
  pending: {
    label: "⏳ Pending",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
  paid: { label: "✓ Paid", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  failed: { label: "✕ Failed", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  useEffect(() => {
    fetchOrders();
  }, []);

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
  const totalOrders = orders.length;
  const totalItems = orders.reduce(
    (s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0),
    0,
  );
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingAmount = orders
    .filter((o) => o.payment_status === "pending" && o.status !== "cancelled")
    .reduce((s, o) => s + (o.total_amount || 0), 0);

  /* ── Filter ── */
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <AppLayout>
      {/* ── Stats ── */}
      <div className="metrics-grid">
        {[
          {
            icon: "📦",
            label: "Total Orders",
            value: totalOrders,
            color: "var(--ember)",
            bg: "var(--ember-glow)",
          },
          {
            icon: "🛍️",
            label: "Total Items",
            value: totalItems,
            color: "var(--blue)",
            bg: "var(--blue-dim)",
          },
          {
            icon: "₹",
            label: "Total Spent",
            value: `₹${totalSpent.toLocaleString("en-IN")}`,
            color: "var(--green)",
            bg: "var(--green-dim)",
          },
          {
            icon: "⏳",
            label: "Pending Payment",
            value: `₹${pendingAmount.toLocaleString("en-IN")}`,
            color: "var(--ember)",
            bg: "var(--ember-glow)",
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
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="toolbar">
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginRight: 4,
          }}
        >
          Filter:
        </span>
        {[
          { key: "all", label: "All" },
          { key: "ordered", label: "New" },
          { key: "confirmed", label: "Preparing" },
          { key: "on-the-way", label: "On the Way" },
          { key: "delivered", label: "Delivered" },
          { key: "cancelled", label: "Cancelled" },
        ].map((f) => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.key === "all"
              ? `All (${orders.length})`
              : `${f.label} (${orders.filter((o) => o.status === f.key).length})`}
          </button>
        ))}
      </div>

      {/* ── Orders Table ── */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Order History</div>
          <span className="chip">{filtered.length} orders</span>
        </div>

        {loading ? (
          <div style={{ padding: 30, color: "var(--text-muted)" }}>
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No orders found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date & Time</th>
                <th>Items Ordered</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((o, index) => {
                const badge = STATUS_BADGE[o.status] || {
                  label: o.status,
                  color: "#888",
                };
                const payment = PAYMENT_BADGE[o.payment_status] || {
                  label: o.payment_status,
                  color: "#888",
                  bg: "#88888820",
                };

                return (
                  <tr
                    onClick={() => setSelectedOrder(o)}
                    key={o._id}
                    style={{ opacity: o.status === "cancelled" ? 0.6 : 1 }}
                  >
                    {/* Sr */}
                    <td
                      className="td-mono"
                      style={{ color: "var(--text-muted)", fontSize: 12 }}
                    >
                      {index + 1}
                    </td>

                    {/* Date & Time */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {formatDate(o.createdAt)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {formatTime(o.createdAt)}
                      </div>
                    </td>

                    {/* Items */}
                    <td>
                      {o.items?.map((item, i) => (
                        <div
                          key={item._id || i}
                          style={{ fontSize: 13, marginBottom: 2 }}
                        >
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                          <span
                            style={{ color: "var(--text-muted)", fontSize: 12 }}
                          >
                            {" "}
                            × {item.quantity} ·{" "}
                            <span style={{ fontFamily: "var(--font-mono)" }}>
                              ₹{item.total}
                            </span>
                          </span>
                        </div>
                      ))}
                    </td>

                    {/* Amount */}
                    <td
                      className="td-mono"
                      style={{ fontWeight: 700, fontSize: 14 }}
                    >
                      ₹{o.total_amount?.toLocaleString("en-IN") || 0}
                    </td>

                    {/* Order Status */}
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 20,
                          color: "#fff",
                          background: badge.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Payment */}
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 20,
                          whiteSpace: "nowrap",
                          color: payment.color,
                          background: payment.bg,
                        }}
                      >
                        {payment.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div className="modal-header">
              <div>
                <h3>Order #{selectedOrder._id}</h3>
                <div className="muted">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="modal-header-right">
                <span className={`badge badge-${selectedOrder.status}`}>
                  {selectedOrder.status}
                </span>

                <button onClick={() => setSelectedOrder(null)}>✕</button>
              </div>
            </div>

            <div className="modal-body grid-60-40">
              {/* LEFT SIDE */}
              <div>
                {/* CUSTOMER */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">👤 Customer</div>
                  </div>
                  <div className="panel-body">
                    <div className="td-primary">
                      {selectedOrder.last_activity?.[0]?.username}
                    </div>
                    <div className="muted">
                      {selectedOrder.last_activity?.[0]?.mobile_no}
                    </div>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">🍽 Items</div>
                  </div>

                  <div className="panel-body">
                    {selectedOrder.items.map((item) => (
                      <div key={item._id} className="item-row">
                        <span>{item.name}</span>
                        <span>
                          {item.quantity} × ₹{item.price}
                        </span>

                        <span
                          className="td-primary "
                          style={{ marginLeft: "5px" }}
                        >
                          = ₹{item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div>
                {/* SUMMARY */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">💰 Summary</div>
                  </div>

                  <div className="panel-body">
                    <div className="summary-row">
                      <span>Total</span>
                      <strong>₹{selectedOrder.total_amount}</strong>
                    </div>

                    <div className="summary-row">
                      <span>Payment</span>
                      <span
                        className={`badge ${
                          selectedOrder.payment_status === "paid"
                            ? "badge-paid"
                            : "badge-unpaid"
                        }`}
                      >
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">📍 Activity</div>
                  </div>

                  <div className="panel-body timeline">
                    {selectedOrder.last_activity.map((a, i) => {
                      const actionText = a.details
                        ?.replaceAll("_", " ")
                        .replace("status changed to", "Status →")
                        .replace("payment collected", "Payment →");

                      return (
                        <div key={i} className="timeline-item">
                          <div className="dot" />

                          <div className="timeline-content">
                            <div className="activity-user">{a.username}</div>

                            <div className="activity-action">{actionText}</div>

                            <div className="muted">
                              {new Date(a.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
