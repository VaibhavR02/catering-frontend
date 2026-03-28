import React, { useCallback, useEffect, useReducer, useState } from "react";
import AppLayout from "../components/AppLayout";
import { api } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

/* ───────── REDUCER ───────── */
const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_ORDERS_REQUEST":
      return { ...state, orderLoading: true, orderError: "" };

    case "FETCH_ORDERS_SUCCESS":
      return {
        ...state,
        orderLoading: false,
        orders: action.payload.orders,
        summary: action.payload.summary,
        societySummary: action.payload.societySummary,
      };

    case "FETCH_ORDERS_FAIL":
      return { ...state, orderLoading: false, orderError: action.payload };

    default:
      return state;
  }
};

export default function VendorDashboard() {
  const [
    { orders, summary, societySummary, orderLoading, orderError },
    dispatch,
  ] = useReducer(reducer, {
    orders: [],
    summary: {},
    societySummary: [],
    orderLoading: false,
    orderError: "",
  });

  const [filter, setFilter] = useState("all");
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [search, setSearch] = useState("");

  /* ───────── FETCH ───────── */
  const fetchOrders = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_ORDERS_REQUEST" });

      const { data } = await api.get("/api/v1/orders/vendor-orders");

      dispatch({
        type: "FETCH_ORDERS_SUCCESS",
        payload: {
          orders: data.data || [],
          summary: data.summary || {},
          societySummary: data.societySummary || [],
        },
      });
    } catch (err) {
      dispatch({
        type: "FETCH_ORDERS_FAIL",
        payload: err?.response?.data?.message || "Failed to load orders",
      });
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ───────── FILTER ───────── */
  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  /* ───────── STATUS CONFIG ───────── */
  const STATUS_BADGE = {
    ordered: { label: "New", color: "#F59E0B" },
    confirmed: { label: "Preparing", color: "#3B82F6" },
    "on-the-way": { label: "On the Way", color: "#8B5CF6" },
    delivered: { label: "Delivered", color: "#10B981" },
    cancelled: { label: "Cancelled", color: "#EF4444" },
  };

  const filteredSocieties = societySummary.filter((s) =>
    s.societyName.toLowerCase().includes(search.toLowerCase()),
  );

  /* ───────── LOADING ───────── */
  if (orderLoading) {
    return (
      <AppLayout>
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pendingCount={summary?.statusCounts?.ordered || 0}>
      <Link to="/vendor/update" className="update-profile-link">
        Update Profile
      </Link>
      {/* ───────── KPI CARDS ───────── */}
      <div className="metrics-grid">
        {[
          { label: "Total Orders", value: summary.totalOrders },
          {
            label: "Total Amount",
            value: `₹${(summary.totalAmount || 0).toLocaleString("en-IN")}`,
          },
          {
            label: "Received",
            value: `₹${(summary.totalReceived || 0).toLocaleString("en-IN")}`,
            type: "success",
          },
          {
            label: "Pending",
            value: `₹${(summary.totalPending || 0).toLocaleString("en-IN")}`,
            type: "warning",
          },
          {
            label: "Delivered",
            value: summary.statusCounts?.delivered,
          },
          {
            label: "Cancelled",
            value: summary.statusCounts?.cancelled,
          },
        ].map((m, i) => (
          <div className={`metric-card ${m.type || ""}`} key={i}>
            <div className="metric-value">{m.value || 0}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ───────── SOCIETY ANALYTICS ───────── */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">🏢 Society Performance</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search Society..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="panel-body">
          <div className="grid-3">
            {/* {societySummary.map((s, i) => { */}

            {filteredSocieties.map((s, i) => {
              const successRate = s.successRate || 0;

              return (
                <div
                  key={i}
                  className={`metric-card society-card ${
                    selectedSociety === s.societyId ? "active" : ""
                  }`}
                >
                  {/* HEADER */}
                  <div className="td-primary">
                    <Link to={`/vendor/orders/${s.societyId}`}>
                      {s.societyName}
                    </Link>
                  </div>

                  <div className="panel-subtitle">
                    📍{" "}
                    {`${s.societyAddress?.street}, ${s.societyAddress?.area}, ${s.societyAddress?.city}`}
                  </div>

                  {/* 💰 FINANCIALS */}
                  <div className="society-finance">
                    <div className="finance-item green">
                      ₹{s.receivedAmount}
                      <span>Received</span>
                    </div>

                    <div className="finance-item orange">
                      ₹{s.pendingAmount}
                      <span>Pending</span>
                    </div>
                  </div>

                  {/* 📊 STATUS */}
                  <div className="status-flow">
                    <span className="badge badge-pending">
                      {s.pendingOrders}
                    </span>
                    <span className="badge badge-delivered">
                      {s.successfulOrders}
                    </span>
                    <span className="badge badge-cancelled">
                      {s.cancelledOrders}
                    </span>
                  </div>

                  {/* 📈 PROGRESS */}
                  <div className="progress-bar">
                    <div
                      className="progress-fill green"
                      style={{ width: `${s.successRate}%` }}
                    />
                  </div>

                  <div className="panel-subtitle">
                    {s.successRate}% success • {s.totalOrders} orders
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
