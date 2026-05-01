import React, { useEffect, useReducer, useCallback } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { api } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import Loading from "../components/Loading";

// ─── Reducer ────────────────────────────────────────────────────────────────

const initialState = {
  orders: [],
  society: null,
  counts: {},
  totalOrders: 0,
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "fetch_request":
      return { ...state, loading: true, error: null };

    case "fetch_success":
      return {
        ...state,
        loading: false,
        orders: action.payload.data || [],
        society: action.payload.society || null,
        counts: action.payload.counts || {},
        totalOrders: action.payload.totalOrders || 0,
      };

    case "fetch_fail":
      return { ...state, loading: false, error: action.payload };

    // Patch status on one or many orders in-place
    case "update_request":
      return {
        ...state,
        orders: state.orders.map((o) =>
          action.payload.orderIds.includes(o._id)
            ? { ...o, _updating: true }
            : o,
        ),
      };

    case "update_success":
      return {
        ...state,
        orders: state.orders.map((o) =>
          action.payload.orderIds.includes(o._id)
            ? { ...o, status: action.payload.status, _updating: false }
            : o,
        ),
        // Recompute counts from patched orders
        counts: recomputeCounts(
          state.orders.map((o) =>
            action.payload.orderIds.includes(o._id)
              ? { ...o, status: action.payload.status }
              : o,
          ),
        ),
      };

    case "update_fail":
      return {
        ...state,
        orders: state.orders.map((o) =>
          action.payload.orderIds.includes(o._id)
            ? { ...o, _updating: false }
            : o,
        ),
      };

    // Patch payment_status on one or many orders in-place
    case "payment_request":
      return {
        ...state,
        orders: state.orders.map((o) =>
          action.payload.orderIds.includes(o._id)
            ? { ...o, _paymentUpdating: true }
            : o,
        ),
      };

    case "payment_success":
      return {
        ...state,
        orders: state.orders.map((o) =>
          action.payload.orderIds.includes(o._id)
            ? { ...o, payment_status: "paid", _paymentUpdating: false }
            : o,
        ),
      };

    case "payment_fail":
      return {
        ...state,
        orders: state.orders.map((o) =>
          action.payload.orderIds.includes(o._id)
            ? { ...o, _paymentUpdating: false }
            : o,
        ),
      };

    default:
      return state;
  }
}

// Recompute counts locally so the summary cards stay accurate
function recomputeCounts(orders) {
  return orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SocietywiseVendorOrders() {
  const toast = useToast();
  const { societyId } = useParams();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { orders, society, counts, totalOrders, loading } = state;

  const [startDate, setStartDate] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
  const [search, setSearch] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [selectedOrders, setSelectedOrders] = React.useState([]);
  const [bulkStatus, setBulkStatus] = React.useState("");
  const [filterTower, setFilterTower] = React.useState("");
  const [filterFloor, setFilterFloor] = React.useState("");
  const [filterCompany, setFilterCompany] = React.useState("");
  const [bulkPaymentUpdating, setBulkPaymentUpdating] = React.useState(false);

  // ── Fetch (full list) ────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    dispatch({ type: "fetch_request" });
    try {
      const { data } = await api.get(
        `/api/v1/orders/societywise-vendor-orders`,
        {
          params: { societyId, startDate, endDate },
        },
      );
      console.log(society);
      dispatch({ type: "fetch_success", payload: data });
    } catch (err) {
      dispatch({ type: "fetch_fail", payload: err.message });
      console.error(err);
    }
  }, [societyId, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [societyId]); // only re-fetch when society changes; date range uses the Apply button

  // ── Status update (patches rows in-place) ────────────────────────────────

  const handleSingleStatusUpdate = async (orderId, newStatus) => {
    dispatch({ type: "update_request", payload: { orderIds: [orderId] } });
    try {
      const res = await api.patch(`/api/v1/orders/status`, {
        orderIds: [orderId],
        status: newStatus,
      });
      dispatch({
        type: "update_success",
        payload: { orderIds: [orderId], status: newStatus },
      });
      toast.success(res.data.message);
    } catch (err) {
      dispatch({ type: "update_fail", payload: { orderIds: [orderId] } });
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const handleBulkStatusUpdate = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to update status for selected orders?",
    );

    if (!isConfirmed) return;
    if (!bulkStatus || selectedOrders.length === 0) return;
    const orderIds = selectedOrders.map((s) => s._id);
    dispatch({ type: "update_request", payload: { orderIds } });
    try {
      const res = await api.patch(`/api/v1/orders/status`, {
        orderIds,
        status: bulkStatus,
      });
      dispatch({
        type: "update_success",
        payload: { orderIds, status: bulkStatus },
      });
      setSelectedOrders([]);
      setBulkStatus("");
      toast.success(res.data.message);
    } catch (err) {
      dispatch({ type: "update_fail", payload: { orderIds } });
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  // ── Payment collection (patches rows in-place) ───────────────────────────

  const handleCollectPayment = async (order) => {
    dispatch({ type: "payment_request", payload: { orderIds: [order._id] } });
    try {
      const res = await api.patch(
        `/api/v1/payments/accept-cash-payment/${order.payment}`,
        { notes: "Payment Received!" },
      );
      dispatch({
        type: "payment_success",
        payload: { orderIds: [order._id] },
      });
      toast.success(res.data.message);
    } catch (err) {
      dispatch({ type: "payment_fail", payload: { orderIds: [order._id] } });
      toast.error(err?.response?.data?.message || "Failed to collect payment");
    }
  };

  const handleBulkCollectPayment = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to collect payment for selected orders?",
    );

    if (!isConfirmed) return;
    const unpaidOrders = selectedOrders.filter(
      (s) => s.payment_status !== "paid" && s.payment,
    );
    if (unpaidOrders.length === 0) {
      toast.error("No unpaid orders in selection");
      return;
    }
    const orderIds = unpaidOrders.map((s) => s._id);
    const paymentIds = unpaidOrders.map((s) => s.payment);
    setBulkPaymentUpdating(true);
    dispatch({ type: "payment_request", payload: { orderIds } });
    try {
      const res = await api.patch(`/api/v1/payments/bulk-collect-cash`, {
        paymentIds,
        notes: "Payment Received! (Bulk update)",
      });
      dispatch({ type: "payment_success", payload: { orderIds } });
      setSelectedOrders([]);
      toast.success(res.data.message);
    } catch (err) {
      dispatch({ type: "payment_fail", payload: { orderIds } });
      toast.error(
        err?.response?.data?.message || "Bulk payment collection failed",
      );
    } finally {
      setBulkPaymentUpdating(false);
    }
  };

  // ── Filtering / selection ────────────────────────────────────────────────

  const uniqueTowers = [
    ...new Set(orders.map((o) => o.society?.tower).filter(Boolean)),
  ];
  const uniqueFloors = [
    ...new Set(orders.map((o) => o.society?.floor).filter(Boolean)),
  ];
  const uniqueCompanies = [
    ...new Set(orders.map((o) => o.society?.company_name).filter(Boolean)),
  ];

  const filteredOrders = orders.filter((o) => {
    const name = o.last_activity?.[0]?.username?.toLowerCase() || "";
    const mobile = o.last_activity?.[0]?.mobile_no || "";
    const company = o.society?.company_name?.toLowerCase() || "";
    const tower = o.society?.tower?.toLowerCase() || "";
    const floor = o.society?.floor?.toLowerCase() || "";

    return (
      (name.includes(search.toLowerCase()) ||
        mobile.includes(search) ||
        company.includes(search.toLowerCase()) ||
        tower.includes(search.toLowerCase()) ||
        floor.includes(search.toLowerCase())) &&
      (filterTower ? o.society?.tower === filterTower : true) &&
      (filterFloor ? o.society?.floor === filterFloor : true) &&
      (filterCompany ? o.society?.company_name === filterCompany : true)
    );
  });

  const allSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedOrders.some((s) => s._id === o._id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(
        filteredOrders.map((o) => ({
          _id: o._id,
          payment_status: o.payment_status,
          payment: o.payment,
        })),
      );
    }
  };

  const toggleSelectOne = (order) => {
    setSelectedOrders((prev) =>
      prev.some((x) => x._id === order._id)
        ? prev.filter((x) => x._id !== order._id)
        : [
            ...prev,
            {
              _id: order._id,
              payment_status: order.payment_status,
              payment: order.payment,
            },
          ],
    );
  };

  return (
    <AppLayout>
      <div className="page-header filter-bar">
        <h2>🏢 Society Orders</h2>
        <button onClick={fetchOrders}>Refresh</button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        society && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">🏢 {society.name}</div>
                <div className="panel-subtitle">
                  📍 {society.address?.street}, {society.address?.area},{" "}
                  {society.address?.city}, {society.address?.state},{" "}
                  {society.address?.pincode}
                </div>
              </div>
            </div>
            <div className="panel-body">
              <div className="status-count-grid">
                <div className="count-card total">
                  <span>{totalOrders || 0}</span>
                  <p>Total</p>
                </div>
                <div className="count-card ordered">
                  <span>{counts.ordered || 0}</span>
                  <p>Ordered</p>
                </div>
                <div className="count-card confirmed">
                  <span>{counts.confirmed || 0}</span>
                  <p>Confirmed</p>
                </div>
                <div className="count-card onway">
                  <span>{counts["on-the-way"] || 0}</span>
                  <p>On the Way</p>
                </div>
                <div className="count-card delivered">
                  <span>{counts.delivered || 0}</span>
                  <p>Delivered</p>
                </div>
                <div className="count-card cancelled">
                  <span>{counts.cancelled || 0}</span>
                  <p>Cancelled</p>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      <div className="filter-bar">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={fetchOrders}>Apply</button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by name, company, tower, floor or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterTower}
          onChange={(e) => setFilterTower(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 13,
          }}
        >
          <option value="">All Towers</option>
          {uniqueTowers.map((t) => (
            <option key={t} value={t}>
              Tower {t}
            </option>
          ))}
        </select>
        <select
          value={filterFloor}
          onChange={(e) => setFilterFloor(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 13,
          }}
        >
          <option value="">All Floors</option>
          {uniqueFloors.map((f) => (
            <option key={f} value={f}>
              Floor {f}
            </option>
          ))}
        </select>
        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 13,
          }}
        >
          <option value="">All Offices</option>
          {uniqueCompanies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(filterTower || filterFloor || filterCompany) && (
          <button
            onClick={() => {
              setFilterTower("");
              setFilterFloor("");
              setFilterCompany("");
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              color: "#555",
            }}
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">📦 Orders</div>
          </div>

          {selectedOrders.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 16px",
                background: "#f0f7ff",
                borderBottom: "1px solid #d0e4ff",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 14 }}>
                {selectedOrders.length} order
                {selectedOrders.length > 1 ? "s" : ""} selected
              </span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              >
                <option value="">-- Change Status --</option>
                <option value="ordered">Ordered</option>
                <option value="confirmed">Confirmed</option>
                <option value="on-the-way">On the Way</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  background: bulkStatus ? "#2563eb" : "#94a3b8",
                  color: "#fff",
                  border: "none",
                  cursor: bulkStatus ? "pointer" : "not-allowed",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Apply
              </button>
              <button
                onClick={handleBulkCollectPayment}
                disabled={bulkPaymentUpdating}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {bulkPaymentUpdating ? "Collecting..." : "💵 Collect Payment"}
              </button>
              <button
                onClick={() => setSelectedOrders([])}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "transparent",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#555",
                }}
              >
                Clear
              </button>
            </div>
          )}

          <div className="panel-body">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        style={{ cursor: "pointer", width: 15, height: 15 }}
                      />
                    </th>
                    <th>Order</th>
                    <th style={{ minWidth: 190 }}>Items</th>
                    <th style={{ minWidth: 190 }}>Customer</th>

                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((o, idx) => {
                      const isChecked = selectedOrders.some(
                        (s) => s._id === o._id,
                      );
                      return (
                        <tr
                          key={o._id}
                          onClick={() => setSelectedOrder(o)}
                          style={{
                            background: isChecked ? "#eff6ff" : undefined,
                            opacity:
                              o._updating || o._paymentUpdating ? 0.5 : 1,
                            transition: "opacity 0.2s, background 0.15s",
                          }}
                        >
                          {/* <td
                            style={{ textAlign: "center" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectOne(o);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectOne(o)}
                              style={{
                                cursor: "pointer",
                                width: 15,
                                height: 15,
                              }}
                            />
                          </td> */}

                          <td
                            style={{ textAlign: "center" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectOne(o);
                            }}
                            onChange={() => toggleSelectOne(o)}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectOne(o)}
                              style={{
                                cursor: "pointer",
                                width: 15,
                                height: 15,
                              }}
                            />
                          </td>
                          <td className="td-mono">#{idx + 1}</td>
                          <td>
                            {o.items?.map((item, i) => (
                              <div
                                key={item._id || i}
                                style={{ fontSize: 13, marginBottom: 2 }}
                              >
                                <span style={{ fontWeight: 600 }}>
                                  {item.name}
                                </span>
                                <span
                                  style={{
                                    color: "var(--text-muted)",
                                    fontSize: 12,
                                  }}
                                >
                                  {" "}
                                  × {item.quantity} ·{" "}
                                  <span
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    ₹{item.total}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </td>
                          <td>
                            <div className="td-primary">
                              {o.last_activity?.[0]?.username}
                            </div>
                            <div className="muted">
                              {o.last_activity?.[0]?.mobile_no}
                            </div>
                            <div className="muted">
                              {o.society?.company_name}, Tower{" "}
                              {o.society?.tower}, floor {o.society?.floor}
                            </div>
                          </td>

                          <td>₹{o.total_amount}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select
                              value={o.status}
                              onChange={(e) =>
                                handleSingleStatusUpdate(o._id, e.target.value)
                              }
                              disabled={o._updating}
                              className={`badge badge-${o.status}`}
                              style={{
                                border: "none",
                                cursor: "pointer",
                                borderRadius: 6,
                                padding: "3px 6px",
                                fontSize: 12,
                                fontWeight: 500,
                                appearance: "auto",
                              }}
                            >
                              <option value="ordered">ordered</option>
                              <option value="confirmed">confirmed</option>
                              <option value="on-the-way">on-the-way</option>
                              <option value="delivered">delivered</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                            {o._updating && " ⏳"}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            {o._paymentUpdating ? (
                              <span className="muted">Collecting...</span>
                            ) : o.payment_status === "paid" ? (
                              <span className="badge badge-paid">paid</span>
                            ) : o.payment_status === "pending" ? (
                              <button
                                onClick={() => handleCollectPayment(o)}
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  background: "#16a34a",
                                  color: "#fff",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  fontWeight: 500,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  {" "}
                                  <span> 💵 </span>
                                  <span> Collect </span>
                                </div>
                              </button>
                            ) : (
                              <span className="badge badge-unpaid">
                                {o.payment_status}
                              </span>
                            )}
                          </td>
                          <td>
                            {new Date(o.createdAt).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        style={{ textAlign: "center", padding: "20px 0" }}
                      >
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            {/* <div className="modal-header">
              <div>
                <h4>Order #{selectedOrder._id}</h4>
                <span className="muted">
                  <span className={`badge badge-${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>
                  &nbsp;|&nbsp;{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="modal-header-right">
                <button onClick={() => setSelectedOrder(null)}>✕</button>
              </div>
            </div> */}
            <div className="modal-header">
              <div className="modal-header-left">
                <h5 className="order-id">Order #{selectedOrder._id}</h5>

                <div className="order-meta">
                  <span className={`status-badge ${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>

                  <span className="divider">•</span>

                  <span className="order-date">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
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
                    <div className="muted">
                      {selectedOrder?.society?.company_name},
                      {selectedOrder?.society?.tower},
                      {selectedOrder?.society?.floor}
                    </div>
                    <div className="muted">
                      {[
                        selectedOrder?.society?.society_name,
                        selectedOrder?.society?.society_address?.street,
                        selectedOrder?.society?.society_address?.area,
                        selectedOrder?.society?.society_address?.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
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
