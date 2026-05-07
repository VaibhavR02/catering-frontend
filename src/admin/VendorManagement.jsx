import React, { useCallback, useEffect, useReducer, useState } from "react";
import AppLayout from "../components/AppLayout";
import { api } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const initialState = {
  vendors: [],
  pagination: {},
  loading: false,
  error: "",
  selectedVendor: null,
  selectedVendorLoading: false,
  toggleLoadingId: null,
  deleteItemLoadingId: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        vendors: action.payload.data,
        pagination: action.payload.pagination,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "FETCH_VENDOR_REQUEST":
      return { ...state, selectedVendorLoading: true };
    case "FETCH_VENDOR_SUCCESS":
      return {
        ...state,
        selectedVendorLoading: false,
        selectedVendor: action.payload,
      };
    case "FETCH_VENDOR_FAIL":
      return { ...state, selectedVendorLoading: false };

    case "TOGGLE_VENDOR":
      return {
        ...state,
        vendors: state.vendors.map((v) =>
          v._id === action.payload ? { ...v, isActive: !v.isActive } : v,
        ),
      };
    case "TOGGLE_VENDOR_REQUEST":
      return {
        ...state,
        toggleLoadingId: action.payload,
      };

    case "TOGGLE_VENDOR_FINISH":
      return {
        ...state,
        toggleLoadingId: null,
      };

    case "DELETE_VENDOR":
      return {
        ...state,
        vendors: state.vendors.filter((v) => v._id !== action.payload),
      };
    case "UPDATE_VENDOR":
      return {
        ...state,
        vendors: state.vendors.map((v) =>
          v._id === action.payload._id ? action.payload : v,
        ),
      };

    case "DELETE_ITEM_REQUEST":
      return {
        ...state,
        deleteItemLoadingId: action.payload,
      };

    case "DELETE_ITEM_SUCCESS":
      return {
        ...state,
        deleteItemLoadingId: null,
        selectedVendor: {
          ...state.selectedVendor,
          vendor: {
            ...state.selectedVendor.vendor,
            items: state.selectedVendor.vendor.items.filter(
              (item) => item._id !== action.payload,
            ),
          },
        },
      };

    case "DELETE_ITEM_FAIL":
      return {
        ...state,
        deleteItemLoadingId: null,
      };

    default:
      return state;
  }
};

/* ───────── TOAST HOOK ───────── */
// function useToast() {
//   const [toasts, setToasts] = useState([]);
//   const show = (message, type = "info") => {
//     const id = Date.now();
//     setToasts((prev) => [...prev, { id, message, type }]);
//     setTimeout(
//       () => setToasts((prev) => prev.filter((t) => t.id !== id)),
//       3500,
//     );
//   };
//   return { toasts, show };
// }

/* ───────── HELPERS ───────── */
function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtRupee(n = 0) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

const AVATAR_CLASSES = ["av-a", "av-b", "av-c", "av-d", "av-e"];
function avatarClass(id = "") {
  const sum = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_CLASSES[sum % AVATAR_CLASSES.length];
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function VendorManagement() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    vendors,
    pagination,
    loading,
    error,
    selectedVendor,
    selectedVendorLoading,
    toggleLoadingId,
    deleteItemLoadingId,
  } = state;

  //   const { toasts, show: showToast } = useToast();
  const toast = useToast();

  /* ── filters / modals ── */
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const [modal, setModal] = useState(null); // 'view' | 'edit' | 'delete' | 'add'
  const [editingVendor, setEditingVendor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* edit form state */
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile_no: "",
    city: "",
    area: "",
    street: "",
    isActive: true,
  });

  /* ───────── FETCH LIST ───────── */
  const fetchVendors = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (activeFilter !== "all") params.isActive = activeFilter === "active";

      const { data } = await api.get("/api/v1/admin/vendors", { params });
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({
        type: "FETCH_FAIL",
        payload: err?.response?.data?.message || "Failed to load vendors",
      });
    }
  }, [search, activeFilter, page]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  /* ───────── FETCH SINGLE ───────── */
  const fetchVendorById = async (id) => {
    try {
      dispatch({ type: "FETCH_VENDOR_REQUEST" });
      const { data } = await api.get(`/api/v1/admin/vendors/${id}`);
      dispatch({ type: "FETCH_VENDOR_SUCCESS", payload: data.data });
    } catch {
      dispatch({ type: "FETCH_VENDOR_FAIL" });
      showToast("Failed to load vendor details", "error");
    }
  };

  /* ───────── TOGGLE ACTIVE ───────── */
  //   const handleToggle = async (vendor) => {
  //     try {
  //       await api.put(`/api/v1/admin/vendors/toggle/${vendor._id}`);
  //       dispatch({ type: "TOGGLE_VENDOR", payload: vendor._id });
  //       toast(
  //         vendor.isActive ? "⏸ Vendor deactivated" : "✅ Vendor activated",
  //         vendor.isActive ? "error" : "success",
  //       );
  //     } catch {
  //       toast("Failed to update status", "error");
  //     }
  //   };

  const handleToggle = async (vendor) => {
    try {
      dispatch({
        type: "TOGGLE_VENDOR_REQUEST",
        payload: vendor._id,
      });

      const response = await api.put(
        `/api/v1/admin/vendors/toggle/${vendor._id}`,
      );

      dispatch({ type: "TOGGLE_VENDOR", payload: vendor._id });
      //   console.log(response);
      const message =
        response.data.message ||
        (vendor.isActive ? "Vendor deactivated" : "Vendor activated");
      const activeStatus = response.data.isActive ? "error" : "success";
      toast.success(message, activeStatus);
    } catch {
      toast.error("Failed to update status", "error");
    } finally {
      dispatch({ type: "TOGGLE_VENDOR_FINISH" });
    }
  };

  /* ───────── DELETE ───────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/admin/vendors/${deleteTarget._id}`);
      dispatch({ type: "DELETE_VENDOR", payload: deleteTarget._id });
      toast.success("🗑 Vendor deleted permanently", "error");
      closeModal("delete");
    } catch {
      toast.error("Failed to delete vendor", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ───────── UPDATE ───────── */
  const handleUpdate = async () => {
    if (!editingVendor) return;
    setActionLoading(true);
    try {
      const payload = {
        name: form.name,
        contact: { email: form.email, mobile_no: form.mobile_no },
        address: { city: form.city, area: form.area, street: form.street },
        isActive: form.isActive,
      };
      const { data } = await api.put(
        `/api/v1/admin/vendors/${editingVendor._id}`,
        payload,
      );
      dispatch({ type: "UPDATE_VENDOR", payload: data.data });
      toast.success("✅ Vendor updated successfully", "success");
      closeModal("edit");
    } catch {
      toast.error("Failed to update vendor", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ───────── DELETE ITEM ───────── */
  //   const handleDeleteItem = async (vendorId, itemId) => {
  //     try {
  //       await api.delete(`/api/v1/admin/vendors/${vendorId}/item/${itemId}`);
  //       toast.success("🗑 Menu item removed", "success");
  //       fetchVendorById(vendorId);
  //     } catch {
  //       toast.error("Failed to remove item", "error");
  //     }
  //   };

  const handleDeleteItem = async (vendorId, itemId) => {
    try {
      dispatch({
        type: "DELETE_ITEM_REQUEST",
        payload: itemId,
      });

      await api.delete(`/api/v1/admin/vendors/${vendorId}/item/${itemId}`);

      dispatch({
        type: "DELETE_ITEM_SUCCESS",
        payload: itemId,
      });

      toast.success("🗑 Menu item removed", "success");
    } catch {
      dispatch({ type: "DELETE_ITEM_FAIL" });
      toast.error("Failed to remove item", "error");
    }
  };

  /* ───────── MODAL HELPERS ───────── */
  const openView = (vendor) => {
    setModal("view");
    fetchVendorById(vendor._id);
  };

  const openEdit = (vendor) => {
    setEditingVendor(vendor);
    setForm({
      name: vendor.name || "",
      email: vendor.contact?.email || "",
      mobile_no: vendor.contact?.mobile_no || "",
      city: vendor.address?.city || "",
      area: vendor.address?.area || "",
      street: vendor.address?.street || "",
      isActive: vendor.isActive,
    });
    setModal("edit");
  };

  const openDelete = (vendor) => {
    setDeleteTarget(vendor);
    setModal("delete");
  };

  const closeModal = (modalType) => {
    setModal(null);
    setEditingVendor(null);
    setDeleteTarget(null);
    dispatch({ type: "FETCH_VENDOR_SUCCESS", payload: null });
  };

  /* ───────── COMPUTED METRICS ───────── */
  const activeCount = vendors.filter((v) => v.isActive).length;
  const inactiveCount = vendors.length - activeCount;

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  return (
    <AppLayout>
      {/* ── TOAST ── */}
      {/* <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div> */}

      {/* ── PAGE HEADER ── */}
      <div className="page-content">
        <div className="page-header" style={{ marginBottom: "24px" }}>
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              🏪 Vendor Management
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "3px",
              }}
            >
              Manage all registered vendors · <span className="live-dot" /> Live
            </p>
          </div>
        </div>

        {/* ── METRICS ── */}
        <div
          className="metrics-grid"
          style={{ gridTemplateColumns: "repeat(4,1fr)" }}
        >
          {[
            {
              label: "Total Vendors",
              value: pagination.total ?? vendors.length,
              icon: "🏪",
            },
            {
              label: "Active",
              value: activeCount,
              icon: "✅",
              color: "var(--green)",
            },
            {
              label: "Inactive",
              value: inactiveCount,
              icon: "⏸",
              color: "var(--red)",
            },
            {
              label: "Showing",
              value: vendors.length,
              icon: "📋",
              color: "var(--ember)",
            },
          ].map((m, i) => (
            <div
              className="metric-card"
              key={i}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div style={{ fontSize: "20px", marginBottom: "10px" }}>
                {m.icon}
              </div>
              <div className="metric-value" style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>

        {/* ── TOOLBAR ── */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by name, email, city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              className={`filter-tab ${activeFilter === f ? "active" : ""}`}
              onClick={() => {
                setActiveFilter(f);
                setPage(1);
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            {pagination.total ? `${pagination.total} total vendors` : ""}
          </span>
        </div>

        {/* ── TABLE PANEL ── */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">📋 All Vendors</div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-muted)",
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-dim)",
                padding: "2px 10px",
                borderRadius: "20px",
              }}
            >
              {vendors.length} vendors
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" />
              <p style={{ marginTop: "12px" }}>Loading vendors...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-icon">⚠️</div>
              <p>{error}</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <p>No vendors found</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    // <VendorRow
                    //   key={v._id}
                    //   vendor={v}
                    //   onView={() => openView(v)}
                    //   onEdit={() => openEdit(v)}
                    //   onToggle={() => handleToggle(v)}
                    //   onDelete={() => openDelete(v)}
                    // />
                    <VendorRow
                      key={v._id}
                      vendor={v}
                      onView={() => openView(v)}
                      onEdit={() => openEdit(v)}
                      onToggle={() => handleToggle(v)}
                      onDelete={() => openDelete(v)}
                      toggleLoading={toggleLoadingId === v._id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── PAGINATION ── */}
          {pagination.pages > 1 && (
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-ghost"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{ padding: "6px 14px", fontSize: "12px" }}
                >
                  ← Prev
                </button>
                <button
                  className="btn-ghost"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{ padding: "6px 14px", fontSize: "12px" }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ MODALS ══════════ */}

      {/* VIEW MODAL */}
      {modal === "view" && (
        <ModalBackdrop onClose={closeModal}>
          <div
            className="modal animate-fadeup"
            style={{ width: "580px", maxWidth: "95%" }}
          >
            <div className="modal-header">
              <div className="modal-header-left">
                <h3
                  className="order-id"
                  style={{ color: "var(--text-primary)" }}
                >
                  Vendor Profile
                </h3>
                {selectedVendor && (
                  <div className="order-meta">
                    <span>{selectedVendor.vendor?.name}</span>
                    <span className="divider">·</span>
                    <span
                      className={`badge ${selectedVendor.vendor?.isActive ? "badge-active" : "badge-cancelled"}`}
                    >
                      {selectedVendor.vendor?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                )}
              </div>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {selectedVendorLoading ? (
                <div className="empty-state">
                  <div className="spinner" />
                </div>
              ) : selectedVendor ? (
                // <VendorDetail
                //   data={selectedVendor}
                //   onEdit={() => {
                //     closeModal();
                //     openEdit(selectedVendor.vendor);
                //   }}
                //   onDeleteItem={handleDeleteItem}
                // />
                <VendorDetail
                  data={selectedVendor}
                  onEdit={() => {
                    closeModal();
                    openEdit(selectedVendor.vendor);
                  }}
                  onDeleteItem={handleDeleteItem}
                  deleteItemLoadingId={deleteItemLoadingId}
                />
              ) : null}
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* EDIT MODAL */}
      {modal === "edit" && (
        <ModalBackdrop onClose={closeModal}>
          <div
            className="modal animate-fadeup"
            style={{ width: "480px", maxWidth: "95%" }}
          >
            <div className="modal-header">
              <div className="modal-header-left">
                <h3
                  className="order-id"
                  style={{ color: "var(--text-primary)" }}
                >
                  Edit Vendor
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {editingVendor?.name}
                </p>
              </div>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <EditVendorForm form={form} setForm={setForm} />
            </div>

            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn-ghost"
                onClick={closeModal}
                style={{ padding: "9px 18px" }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUpdate}
                disabled={actionLoading}
                style={{ padding: "9px 18px" }}
              >
                {actionLoading ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* DELETE CONFIRM MODAL */}
      {modal === "delete" && (
        <ModalBackdrop onClose={closeModal}>
          <div
            className="modal animate-fadeup"
            style={{ width: "380px", maxWidth: "95%", textAlign: "center" }}
          >
            <div style={{ padding: "32px 24px" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>🗑</div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Delete Vendor?
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  marginBottom: "24px",
                }}
              >
                You are about to permanently delete{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {deleteTarget?.name}
                </strong>
                . This action cannot be undone.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button
                  className="btn-ghost"
                  onClick={closeModal}
                  style={{ padding: "9px 20px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  style={{
                    background: "var(--red-dim)",
                    border: "1px solid var(--red)",
                    borderRadius: "var(--radius-md)",
                    padding: "9px 20px",
                    fontFamily: "var(--font-display)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--red)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {actionLoading ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </ModalBackdrop>
      )}
    </AppLayout>
  );
}

/* ═══════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════ */

function VendorRow({
  vendor: v,
  onView,
  onEdit,
  onToggle,
  onDelete,
  toggleLoading,
}) {
  return (
    <tr onClick={onView} style={{ cursor: "pointer" }}>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className={`user-avatar ${avatarClass(v._id)}`}>
            {initials(v.name)}
          </div>
          <div>
            <div className="td-primary">{v.name}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {v.owner?.username}
            </div>
          </div>
        </div>
      </td>
      <td>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {v.contact?.email}
        </div>
        <div className="td-mono" style={{ color: "var(--text-muted)" }}>
          {v.contact?.mobile_no}
        </div>
      </td>
      <td className="td-primary">{v.address?.city}</td>
      <td className="td-primary td-mono">{v.stats?.totalOrders ?? "—"}</td>
      <td className="td-primary">{fmtRupee(v.stats?.totalRevenue)}</td>
      <td>
        <span
          className={`badge ${v.isActive ? "badge-active" : "badge-cancelled"}`}
        >
          {v.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="td-mono" style={{ fontSize: "11px" }}>
        {fmtDate(v.createdAt)}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", gap: "6px" }}>
          <ActionBtn title="View" onClick={onView}>
            👁
          </ActionBtn>
          <ActionBtn title="Edit" onClick={onEdit}>
            ✏
          </ActionBtn>
          {/* <ActionBtn
            title={v.isActive ? "Deactivate" : "Activate"}
            onClick={onToggle}
            color={v.isActive ? "var(--red)" : "var(--green)"}
          >
            {v.isActive ? "⏸" : "▶"}
          </ActionBtn> */}
          <ActionBtn
            title={v.isActive ? "Deactivate" : "Activate"}
            onClick={onToggle}
            disabled={toggleLoading}
            color={v.isActive ? "var(--red)" : "var(--green)"}
          >
            {toggleLoading ? "⏳" : v.isActive ? "⏸" : "▶"}
          </ActionBtn>
          <ActionBtn title="Delete" onClick={onDelete} color="var(--red)">
            🗑
          </ActionBtn>
        </div>
      </td>
    </tr>
  );
}

function ActionBtn({ children, title, onClick, color }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: "var(--bg-overlay)",
        border: "1px solid var(--border-dim)",
        borderRadius: "var(--radius-sm)",
        padding: "6px 8px",
        cursor: "pointer",
        fontSize: "13px",
        color: color || "var(--text-secondary)",
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-hover)";
        e.currentTarget.style.borderColor = "var(--border-base)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-overlay)";
        e.currentTarget.style.borderColor = "var(--border-dim)";
      }}
    >
      {children}
    </button>
  );
}

function ModalBackdrop({ children, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      {children}
    </div>
  );
}

function VendorDetail({ data, onEdit, onDeleteItem, deleteItemLoadingId }) {
  const { vendor, stats, recentOrders = [] } = data;
  if (!vendor) return null;

  return (
    <div>
      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: "16px" }}>
        {[
          {
            label: "Total Orders",
            value: stats?.totalOrders ?? 0,
            color: "var(--ember)",
          },
          {
            label: "Revenue",
            value: fmtRupee(stats?.totalRevenue),
            color: "var(--green)",
          },
          {
            label: "Status",
            value: vendor.isActive ? "Active" : "Inactive",
            color: vendor.isActive ? "var(--green)" : "var(--red)",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="metric-card"
            style={{ padding: "14px", textAlign: "center" }}
          >
            <div
              className="metric-value"
              style={{ color: s.color, fontSize: "18px" }}
            >
              {s.value}
            </div>
            <div className="metric-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info grid */}
      <div className="grid-2" style={{ marginBottom: "16px", gap: "10px" }}>
        {[
          { label: "Email", value: vendor.contact?.email },
          { label: "Mobile", value: vendor.contact?.mobile_no },
          { label: "City", value: vendor.address?.city },
          { label: "Area", value: vendor.address?.area },
          { label: "Street", value: vendor.address?.street },
          { label: "Owner", value: vendor.owner?.username },
          { label: "Joined", value: fmtDate(vendor.createdAt) },
          { label: "Owner Email", value: vendor.owner?.email },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-dim)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginBottom: "4px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {item.value || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Menu Items */}
      {vendor.items?.length > 0 && (
        <>
          <div className="nav-section-title" style={{ marginBottom: "8px" }}>
            Menu Items
          </div>
          <div style={{ marginBottom: "16px" }}>
            {vendor.items.map((item) => (
              <div
                key={item._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {item.category}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--ember)",
                    }}
                  >
                    {fmtRupee(item.price)}
                  </span>
                  {/* <button
                    onClick={() => onDeleteItem(vendor._id, item._id)}
                    style={{
                      background: "var(--red-dim)",
                      border: "1px solid var(--red)",
                      borderRadius: "var(--radius-sm)",
                      padding: "3px 8px",
                      cursor: "pointer",
                      color: "var(--red)",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button> */}
                  <button
                    disabled={deleteItemLoadingId === item._id}
                    onClick={() => onDeleteItem(vendor._id, item._id)}
                    style={{
                      background: "var(--red-dim)",
                      border: "1px solid var(--red)",
                      borderRadius: "var(--radius-sm)",
                      padding: "3px 8px",
                      cursor:
                        deleteItemLoadingId === item._id
                          ? "not-allowed"
                          : "pointer",
                      color: "var(--red)",
                      fontSize: "11px",
                      fontWeight: 600,
                      opacity: deleteItemLoadingId === item._id ? 0.6 : 1,
                    }}
                  >
                    {deleteItemLoadingId === item._id
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <>
          <div className="nav-section-title" style={{ marginBottom: "8px" }}>
            Recent Orders
          </div>
          {recentOrders.map((o) => (
            <div
              key={o._id}
              className="order-card compact"
              style={{ marginBottom: "8px" }}
            >
              <div className="order-left">
                <div className="order-name">{o.user?.username || "User"}</div>
                <div className="order-sub">{o.user?.email}</div>
              </div>
              <div className="order-right">
                <span className={`status ${o.status}`}>{o.status}</span>
                <div className="order-time">{fmtDate(o.createdAt)}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function EditVendorForm({ form, setForm }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div>
      <div className="field">
        <label className="field-label">Vendor Name</label>
        <input
          className="field-input"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Tiffinwala Express"
        />
      </div>
      <div className="grid-2" style={{ gap: "12px" }}>
        <div className="field">
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="vendor@email.com"
          />
        </div>
        <div className="field">
          <label className="field-label">Mobile</label>
          <input
            className="field-input"
            value={form.mobile_no}
            onChange={set("mobile_no")}
            placeholder="+91 9999999999"
          />
        </div>
      </div>
      <div className="grid-2" style={{ gap: "12px" }}>
        <div className="field">
          <label className="field-label">City</label>
          <input
            className="field-input"
            value={form.city}
            onChange={set("city")}
            placeholder="Pune"
          />
        </div>
        <div className="field">
          <label className="field-label">Area</label>
          <input
            className="field-input"
            value={form.area}
            onChange={set("area")}
            placeholder="Kothrud"
          />
        </div>
      </div>
      <div className="field">
        <label className="field-label">Street Address</label>
        <input
          className="field-input"
          value={form.street}
          onChange={set("street")}
          placeholder="123 Main Street"
        />
      </div>
      <div
        className="field"
        style={{ display: "flex", alignItems: "center", gap: "12px" }}
      >
        <label className="field-label" style={{ margin: 0 }}>
          Active
        </label>
        <label
          style={{
            position: "relative",
            display: "inline-block",
            width: "42px",
            height: "22px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: "absolute",
              inset: 0,
              background: form.isActive
                ? "var(--green-dim)"
                : "var(--bg-active)",
              border: `1px solid ${form.isActive ? "var(--green)" : "var(--border-base)"}`,
              borderRadius: "22px",
              transition: "0.2s",
            }}
          >
            <span
              style={{
                position: "absolute",
                width: "16px",
                height: "16px",
                left: form.isActive ? "22px" : "2px",
                top: "2px",
                background: form.isActive
                  ? "var(--green)"
                  : "var(--text-muted)",
                borderRadius: "50%",
                transition: "0.2s",
              }}
            />
          </span>
        </label>
        <span
          style={{
            fontSize: "12px",
            color: form.isActive ? "var(--green)" : "var(--text-muted)",
          }}
        >
          {form.isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}
