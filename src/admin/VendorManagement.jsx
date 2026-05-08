// import React, { useCallback, useEffect, useReducer, useState } from "react";
// import AppLayout from "../components/AppLayout";
// import { api } from "../contexts/AuthContext";
// import { useToast } from "../contexts/ToastContext";

// /* ═══════════════════════════════════════════════
//    REDUCER
// ═══════════════════════════════════════════════ */
// const initialState = {
//   vendors: [],
//   pagination: {},
//   loading: false,
//   error: "",
//   selectedVendor: null,
//   selectedVendorLoading: false,
//   toggleLoadingId: null,
//   deleteItemLoadingId: null,
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "FETCH_REQUEST":
//       return { ...state, loading: true, error: "" };
//     case "FETCH_SUCCESS":
//       return {
//         ...state,
//         loading: false,
//         vendors: action.payload.data,
//         pagination: action.payload.pagination,
//       };
//     case "FETCH_FAIL":
//       return { ...state, loading: false, error: action.payload };

//     case "FETCH_VENDOR_REQUEST":
//       return { ...state, selectedVendorLoading: true };
//     case "FETCH_VENDOR_SUCCESS":
//       return {
//         ...state,
//         selectedVendorLoading: false,
//         selectedVendor: action.payload,
//       };
//     case "FETCH_VENDOR_FAIL":
//       return { ...state, selectedVendorLoading: false };

//     case "TOGGLE_VENDOR_REQUEST":
//       return { ...state, toggleLoadingId: action.payload };
//     case "TOGGLE_VENDOR":
//       return {
//         ...state,
//         vendors: state.vendors.map((v) =>
//           v._id === action.payload ? { ...v, isActive: !v.isActive } : v,
//         ),
//       };
//     case "TOGGLE_VENDOR_FINISH":
//       return { ...state, toggleLoadingId: null };

//     case "DELETE_VENDOR":
//       return {
//         ...state,
//         vendors: state.vendors.filter((v) => v._id !== action.payload),
//       };

//     case "UPDATE_VENDOR":
//       return {
//         ...state,
//         vendors: state.vendors.map((v) =>
//           v._id === action.payload._id ? action.payload : v,
//         ),
//       };

//     case "ADD_VENDOR":
//       return { ...state, vendors: [action.payload, ...state.vendors] };

//     case "ASSIGN_OWNER":
//       return {
//         ...state,
//         vendors: state.vendors.map((v) =>
//           v._id === action.payload._id ? action.payload : v,
//         ),
//       };

//     case "DELETE_ITEM_REQUEST":
//       return { ...state, deleteItemLoadingId: action.payload };
//     case "DELETE_ITEM_SUCCESS":
//       return {
//         ...state,
//         deleteItemLoadingId: null,
//         selectedVendor: {
//           ...state.selectedVendor,
//           vendor: {
//             ...state.selectedVendor.vendor,
//             items: state.selectedVendor.vendor.items.filter(
//               (item) => item._id !== action.payload,
//             ),
//           },
//         },
//       };
//     case "DELETE_ITEM_FAIL":
//       return { ...state, deleteItemLoadingId: null };

//     default:
//       return state;
//   }
// };

// /* ═══════════════════════════════════════════════
//    HELPERS
// ═══════════════════════════════════════════════ */
// function initials(name = "") {
//   return name
//     .split(" ")
//     .slice(0, 2)
//     .map((w) => w[0])
//     .join("")
//     .toUpperCase();
// }
// function fmtDate(iso) {
//   return new Date(iso).toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }
// function fmtRupee(n = 0) {
//   return "₹" + Number(n).toLocaleString("en-IN");
// }
// const AVATAR_CLASSES = ["av-a", "av-b", "av-c", "av-d", "av-e"];
// function avatarClass(id = "") {
//   const sum = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
//   return AVATAR_CLASSES[sum % AVATAR_CLASSES.length];
// }

// /* blank forms */
// const BLANK_ADD_FORM = {
//   name: "",
//   ownerId: "",
//   ownerSearch: "",
//   ownerSelected: null,
//   email: "",
//   mobile_no: "",
//   plotNo: "",
//   street: "",
//   area: "",
//   city: "",
//   state: "",
//   pincode: "",
//   isActive: true,
// };
// const BLANK_ASSIGN_FORM = {
//   ownerSearch: "",
//   ownerSelected: null,
// };

// /* ═══════════════════════════════════════════════
//    MAIN COMPONENT
// ═══════════════════════════════════════════════ */
// export default function VendorManagement() {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const {
//     vendors,
//     pagination,
//     loading,
//     error,
//     selectedVendor,
//     selectedVendorLoading,
//     toggleLoadingId,
//     deleteItemLoadingId,
//   } = state;

//   const toast = useToast();

//   /* ── ui state ── */
//   const [search, setSearch] = useState("");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [page, setPage] = useState(1);
//   const LIMIT = 10;

//   const [modal, setModal] = useState(null); // 'view'|'edit'|'delete'|'add'|'assign'
//   const [editingVendor, setEditingVendor] = useState(null);
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [assignTarget, setAssignTarget] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   /* ── form state ── */
//   const [editForm, setEditForm] = useState({
//     name: "",
//     email: "",
//     mobile_no: "",
//     city: "",
//     area: "",
//     street: "",
//     isActive: true,
//   });
//   const [addForm, setAddForm] = useState(BLANK_ADD_FORM);
//   const [assignForm, setAssignForm] = useState(BLANK_ASSIGN_FORM);

//   /* user search state shared by add + assign modals */
//   const [userResults, setUserResults] = useState([]);
//   const [userSearchLoading, setUserSearchLoading] = useState(false);

//   /* ───────── FETCH VENDORS ───────── */
//   const fetchVendors = useCallback(async () => {
//     try {
//       dispatch({ type: "FETCH_REQUEST" });
//       const params = { page, limit: LIMIT };
//       if (search) params.search = search;
//       if (activeFilter !== "all") params.isActive = activeFilter === "active";
//       const { data } = await api.get("/api/v1/admin/vendors", { params });
//       dispatch({ type: "FETCH_SUCCESS", payload: data });
//     } catch (err) {
//       dispatch({
//         type: "FETCH_FAIL",
//         payload: err?.response?.data?.message || "Failed to load vendors",
//       });
//     }
//   }, [search, activeFilter, page]);

//   useEffect(() => {
//     fetchVendors();
//   }, [fetchVendors]);

//   /* ───────── FETCH SINGLE ───────── */
//   const fetchVendorById = async (id) => {
//     try {
//       dispatch({ type: "FETCH_VENDOR_REQUEST" });
//       const { data } = await api.get(`/api/v1/admin/vendors/${id}`);
//       dispatch({ type: "FETCH_VENDOR_SUCCESS", payload: data.data });
//     } catch {
//       dispatch({ type: "FETCH_VENDOR_FAIL" });
//       toast.error("Failed to load vendor details");
//     }
//   };

//   /* ───────── SEARCH USERS (for owner picker) ───────── */
//   const searchUsers = async (query) => {
//     if (!query || query.length < 2) {
//       setUserResults([]);
//       return;
//     }
//     try {
//       setUserSearchLoading(true);
//       const { data } = await api.get("/api/v1/admin/users", {
//         params: { search: query, limit: 8 },
//       });
//       setUserResults(data.data || []);
//     } catch {
//       setUserResults([]);
//     } finally {
//       setUserSearchLoading(false);
//     }
//   };

//   /* ───────── TOGGLE ───────── */
//   const handleToggle = async (vendor) => {
//     try {
//       dispatch({ type: "TOGGLE_VENDOR_REQUEST", payload: vendor._id });
//       const response = await api.put(
//         `/api/v1/admin/vendors/toggle/${vendor._id}`,
//       );
//       dispatch({ type: "TOGGLE_VENDOR", payload: vendor._id });
//       const message =
//         response.data.message ||
//         (vendor.isActive ? "Vendor deactivated" : "Vendor activated");
//       vendor.isActive ? toast.error(message) : toast.success(message);
//     } catch {
//       toast.error("Failed to update status");
//     } finally {
//       dispatch({ type: "TOGGLE_VENDOR_FINISH" });
//     }
//   };

//   /* ───────── DELETE VENDOR ───────── */
//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     setActionLoading(true);
//     try {
//       await api.delete(`/api/v1/admin/vendors/${deleteTarget._id}`);
//       dispatch({ type: "DELETE_VENDOR", payload: deleteTarget._id });
//       toast.success("🗑 Vendor deleted permanently");
//       closeModal();
//     } catch {
//       toast.error("Failed to delete vendor");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ───────── UPDATE VENDOR ───────── */
//   const handleUpdate = async () => {
//     if (!editingVendor) return;
//     setActionLoading(true);
//     try {
//       const payload = {
//         name: editForm.name,
//         contact: { email: editForm.email, mobile_no: editForm.mobile_no },
//         address: {
//           city: editForm.city,
//           area: editForm.area,
//           street: editForm.street,
//         },
//         isActive: editForm.isActive,
//       };
//       const { data } = await api.put(
//         `/api/v1/admin/vendors/${editingVendor._id}`,
//         payload,
//       );
//       dispatch({ type: "UPDATE_VENDOR", payload: data.data });
//       toast.success("✅ Vendor updated successfully");
//       closeModal();
//     } catch {
//       toast.error("Failed to update vendor");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ───────── CREATE VENDOR ───────── */
//   const handleCreate = async () => {
//     if (!addForm.name.trim()) return toast.error("Vendor name is required");
//     if (!addForm.ownerSelected) return toast.error("Please select an owner");

//     setActionLoading(true);
//     try {
//       const payload = {
//         name: addForm.name,
//         ownerId: addForm.ownerSelected._id,
//         contact: { email: addForm.email, mobile_no: addForm.mobile_no },
//         address: {
//           plotNo: addForm.plotNo,
//           street: addForm.street,
//           area: addForm.area,
//           city: addForm.city,
//           state: addForm.state,
//           pincode: addForm.pincode,
//         },
//         isActive: addForm.isActive,
//       };
//       const { data } = await api.post("/api/v1/admin/vendors", payload);
//       dispatch({ type: "ADD_VENDOR", payload: data.data });
//       toast.success("🏪 Vendor created successfully");
//       closeModal();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to create vendor");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ───────── ASSIGN OWNER ───────── */
//   const handleAssignOwner = async () => {
//     if (!assignForm.ownerSelected)
//       return toast.error("Please select a new owner");
//     if (!assignTarget) return;

//     setActionLoading(true);
//     try {
//       const { data } = await api.patch(
//         `/api/v1/admin/vendors/${assignTarget._id}/assign-owner`,
//         { newOwnerId: assignForm.ownerSelected._id },
//       );
//       dispatch({ type: "ASSIGN_OWNER", payload: data.data });
//       toast.success(
//         `✅ Owner reassigned to ${assignForm.ownerSelected.username}`,
//       );
//       closeModal();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to reassign owner");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ───────── DELETE ITEM ───────── */
//   const handleDeleteItem = async (vendorId, itemId) => {
//     try {
//       dispatch({ type: "DELETE_ITEM_REQUEST", payload: itemId });
//       await api.delete(`/api/v1/admin/vendors/${vendorId}/item/${itemId}`);
//       dispatch({ type: "DELETE_ITEM_SUCCESS", payload: itemId });
//       toast.success("🗑 Menu item removed");
//     } catch {
//       dispatch({ type: "DELETE_ITEM_FAIL" });
//       toast.error("Failed to remove item");
//     }
//   };

//   /* ───────── MODAL HELPERS ───────── */
//   const openView = (vendor) => {
//     setModal("view");
//     fetchVendorById(vendor._id);
//   };

//   const openEdit = (vendor) => {
//     setEditingVendor(vendor);
//     setEditForm({
//       name: vendor.name || "",
//       email: vendor.contact?.email || "",
//       mobile_no: vendor.contact?.mobile_no || "",
//       city: vendor.address?.city || "",
//       area: vendor.address?.area || "",
//       street: vendor.address?.street || "",
//       isActive: vendor.isActive,
//     });
//     setModal("edit");
//   };

//   const openDelete = (vendor) => {
//     setDeleteTarget(vendor);
//     setModal("delete");
//   };

//   const openAdd = () => {
//     setAddForm(BLANK_ADD_FORM);
//     setUserResults([]);
//     setModal("add");
//   };

//   const openAssign = (vendor) => {
//     setAssignTarget(vendor);
//     setAssignForm(BLANK_ASSIGN_FORM);
//     setUserResults([]);
//     setModal("assign");
//   };

//   const closeModal = () => {
//     setModal(null);
//     setEditingVendor(null);
//     setDeleteTarget(null);
//     setAssignTarget(null);
//     setUserResults([]);
//     dispatch({ type: "FETCH_VENDOR_SUCCESS", payload: null });
//   };

//   /* ── computed ── */
//   const activeCount = vendors.filter((v) => v.isActive).length;
//   const inactiveCount = vendors.length - activeCount;

//   /* ═══════════════════════════════════════
//      RENDER
//   ═══════════════════════════════════════ */
//   return (
//     <AppLayout>
//       <div className="page-content">
//         {/* ── PAGE HEADER ── */}
//         <div className="page-header" style={{ marginBottom: "24px" }}>
//           <div>
//             <h1
//               style={{
//                 fontSize: "20px",
//                 fontWeight: 800,
//                 letterSpacing: "-0.5px",
//               }}
//             >
//               🏪 Vendor Management
//             </h1>
//             <p
//               style={{
//                 fontSize: "12px",
//                 color: "var(--text-muted)",
//                 marginTop: "3px",
//               }}
//             >
//               Manage all registered vendors · <span className="live-dot" /> Live
//             </p>
//           </div>
//           <div>
//             <button className="btn-primary" onClick={openAdd}>
//               ＋ Add Vendor
//             </button>
//           </div>
//         </div>

//         {/* ── METRICS ── */}
//         <div
//           className="metrics-grid"
//           style={{ gridTemplateColumns: "repeat(4,1fr)" }}
//         >
//           {[
//             {
//               label: "Total Vendors",
//               value: pagination.total ?? vendors.length,
//               icon: "🏪",
//             },
//             {
//               label: "Active",
//               value: activeCount,
//               icon: "✅",
//               color: "var(--green)",
//             },
//             {
//               label: "Inactive",
//               value: inactiveCount,
//               icon: "⏸",
//               color: "var(--red)",
//             },
//             {
//               label: "Showing",
//               value: vendors.length,
//               icon: "📋",
//               color: "var(--ember)",
//             },
//           ].map((m, i) => (
//             <div
//               className="metric-card"
//               key={i}
//               style={{ animationDelay: `${i * 0.06}s` }}
//             >
//               <div style={{ fontSize: "20px", marginBottom: "10px" }}>
//                 {m.icon}
//               </div>
//               <div className="metric-value" style={{ color: m.color }}>
//                 {m.value}
//               </div>
//               <div className="metric-label">{m.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* ── TOOLBAR ── */}
//         <div className="toolbar">
//           <div className="search-wrap">
//             <span className="search-icon">🔍</span>
//             <input
//               className="search-input"
//               placeholder="Search by name, email, city..."
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setPage(1);
//               }}
//             />
//           </div>
//           {["all", "active", "inactive"].map((f) => (
//             <button
//               key={f}
//               className={`filter-tab ${activeFilter === f ? "active" : ""}`}
//               onClick={() => {
//                 setActiveFilter(f);
//                 setPage(1);
//               }}
//             >
//               {f.charAt(0).toUpperCase() + f.slice(1)}
//             </button>
//           ))}
//           <span
//             style={{
//               marginLeft: "auto",
//               fontSize: "12px",
//               color: "var(--text-muted)",
//             }}
//           >
//             {pagination.total ? `${pagination.total} total vendors` : ""}
//           </span>
//         </div>

//         {/* ── TABLE PANEL ── */}
//         <div className="panel">
//           <div className="panel-header">
//             <div className="panel-title">📋 All Vendors</div>
//             <span
//               style={{
//                 fontFamily: "var(--font-mono)",
//                 fontSize: "11px",
//                 color: "var(--text-muted)",
//                 background: "var(--bg-overlay)",
//                 border: "1px solid var(--border-dim)",
//                 padding: "2px 10px",
//                 borderRadius: "20px",
//               }}
//             >
//               {vendors.length} vendors
//             </span>
//           </div>

//           {loading ? (
//             <div className="empty-state">
//               <div className="spinner" />
//               <p style={{ marginTop: "12px" }}>Loading vendors...</p>
//             </div>
//           ) : error ? (
//             <div className="empty-state">
//               <div className="empty-icon">⚠️</div>
//               <p>{error}</p>
//             </div>
//           ) : vendors.length === 0 ? (
//             <div className="empty-state">
//               <div className="empty-icon">🏪</div>
//               <p>No vendors found</p>
//             </div>
//           ) : (
//             <div className="table-wrap">
//               <table className="data-table">
//                 <thead>
//                   <tr>
//                     <th>Vendor</th>
//                     <th>Contact</th>
//                     <th>Location</th>
//                     <th>Owner</th>
//                     <th>Status</th>
//                     <th>Joined</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {vendors.map((v) => (
//                     <VendorRow
//                       key={v._id}
//                       vendor={v}
//                       onView={() => openView(v)}
//                       onEdit={() => openEdit(v)}
//                       onToggle={() => handleToggle(v)}
//                       onDelete={() => openDelete(v)}
//                       onAssign={() => openAssign(v)}
//                       toggleLoading={toggleLoadingId === v._id}
//                     />
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* ── PAGINATION ── */}
//           {pagination.pages > 1 && (
//             <div
//               style={{
//                 padding: "14px 20px",
//                 borderTop: "1px solid var(--border-subtle)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//               }}
//             >
//               <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
//                 Page {pagination.page} of {pagination.pages}
//               </span>
//               <div style={{ display: "flex", gap: "8px" }}>
//                 <button
//                   className="btn-ghost"
//                   disabled={pagination.page <= 1}
//                   onClick={() => setPage((p) => p - 1)}
//                   style={{ padding: "6px 14px", fontSize: "12px" }}
//                 >
//                   ← Prev
//                 </button>
//                 <button
//                   className="btn-ghost"
//                   disabled={pagination.page >= pagination.pages}
//                   onClick={() => setPage((p) => p + 1)}
//                   style={{ padding: "6px 14px", fontSize: "12px" }}
//                 >
//                   Next →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ══════════════════════════════════════
//           MODALS
//       ══════════════════════════════════════ */}

//       {/* VIEW */}
//       {modal === "view" && (
//         <ModalBackdrop onClose={closeModal}>
//           <div
//             className="modal animate-fadeup"
//             style={{ width: "580px", maxWidth: "95%" }}
//           >
//             <div className="modal-header">
//               <div className="modal-header-left">
//                 <h3
//                   className="order-id"
//                   style={{ color: "var(--text-primary)" }}
//                 >
//                   Vendor Profile
//                 </h3>
//                 {selectedVendor && (
//                   <div className="order-meta">
//                     <span>{selectedVendor.vendor?.name}</span>
//                     <span className="divider">·</span>
//                     <span
//                       className={`badge ${selectedVendor.vendor?.isActive ? "badge-active" : "badge-cancelled"}`}
//                     >
//                       {selectedVendor.vendor?.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </div>
//                 )}
//               </div>
//               <button className="close-btn" onClick={closeModal}>
//                 ✕
//               </button>
//             </div>
//             <div className="modal-body">
//               {selectedVendorLoading ? (
//                 <div className="empty-state">
//                   <div className="spinner" />
//                 </div>
//               ) : selectedVendor ? (
//                 <VendorDetail
//                   data={selectedVendor}
//                   onEdit={() => {
//                     closeModal();
//                     openEdit(selectedVendor.vendor);
//                   }}
//                   onAssign={() => {
//                     closeModal();
//                     openAssign(selectedVendor.vendor);
//                   }}
//                   onDeleteItem={handleDeleteItem}
//                   deleteItemLoadingId={deleteItemLoadingId}
//                 />
//               ) : null}
//             </div>
//           </div>
//         </ModalBackdrop>
//       )}

//       {/* EDIT */}
//       {modal === "edit" && (
//         <ModalBackdrop onClose={closeModal}>
//           <div
//             className="modal animate-fadeup"
//             style={{ width: "480px", maxWidth: "95%" }}
//           >
//             <div className="modal-header">
//               <div className="modal-header-left">
//                 <h3
//                   className="order-id"
//                   style={{ color: "var(--text-primary)" }}
//                 >
//                   Edit Vendor
//                 </h3>
//                 <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
//                   {editingVendor?.name}
//                 </p>
//               </div>
//               <button className="close-btn" onClick={closeModal}>
//                 ✕
//               </button>
//             </div>
//             <div className="modal-body">
//               <EditVendorForm form={editForm} setForm={setEditForm} />
//             </div>
//             <ModalFooter
//               onCancel={closeModal}
//               onConfirm={handleUpdate}
//               loading={actionLoading}
//               confirmLabel="💾 Save Changes"
//             />
//           </div>
//         </ModalBackdrop>
//       )}

//       {/* ADD VENDOR */}
//       {modal === "add" && (
//         <ModalBackdrop onClose={closeModal}>
//           <div
//             className="modal animate-fadeup"
//             style={{ width: "520px", maxWidth: "95%" }}
//           >
//             <div className="modal-header">
//               <div className="modal-header-left">
//                 <h3
//                   className="order-id"
//                   style={{ color: "var(--text-primary)" }}
//                 >
//                   Add New Vendor
//                 </h3>
//                 <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
//                   Create a vendor and assign an owner
//                 </p>
//               </div>
//               <button className="close-btn" onClick={closeModal}>
//                 ✕
//               </button>
//             </div>
//             <div className="modal-body">
//               <AddVendorForm
//                 form={addForm}
//                 setForm={setAddForm}
//                 userResults={userResults}
//                 userSearchLoading={userSearchLoading}
//                 onUserSearch={(q) => searchUsers(q)}
//                 onUserSelect={(user) => {
//                   setAddForm((f) => ({
//                     ...f,
//                     ownerSelected: user,
//                     ownerSearch: user.username,
//                     ownerId: user._id,
//                   }));
//                   setUserResults([]);
//                 }}
//               />
//             </div>
//             <ModalFooter
//               onCancel={closeModal}
//               onConfirm={handleCreate}
//               loading={actionLoading}
//               confirmLabel="🏪 Create Vendor"
//             />
//           </div>
//         </ModalBackdrop>
//       )}

//       {/* ASSIGN OWNER */}
//       {modal === "assign" && (
//         <ModalBackdrop onClose={closeModal}>
//           <div
//             className="modal animate-fadeup"
//             style={{ width: "420px", maxWidth: "95%" }}
//           >
//             <div className="modal-header">
//               <div className="modal-header-left">
//                 <h3
//                   className="order-id"
//                   style={{ color: "var(--text-primary)" }}
//                 >
//                   Assign New Owner
//                 </h3>
//                 <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
//                   Vendor:{" "}
//                   <strong style={{ color: "var(--ember)" }}>
//                     {assignTarget?.name}
//                   </strong>
//                 </p>
//               </div>
//               <button className="close-btn" onClick={closeModal}>
//                 ✕
//               </button>
//             </div>
//             <div className="modal-body">
//               {/* current owner card */}
//               <div
//                 style={{
//                   background: "var(--bg-overlay)",
//                   border: "1px solid var(--border-dim)",
//                   borderRadius: "var(--radius-md)",
//                   padding: "12px 14px",
//                   marginBottom: "20px",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: "10px",
//                     fontWeight: 600,
//                     color: "var(--text-muted)",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.6px",
//                     marginBottom: "6px",
//                   }}
//                 >
//                   Current Owner
//                 </div>
//                 <div
//                   style={{ display: "flex", alignItems: "center", gap: "10px" }}
//                 >
//                   <div
//                     className={`user-avatar ${avatarClass(assignTarget?._id || "")}`}
//                     style={{ width: "32px", height: "32px", fontSize: "11px" }}
//                   >
//                     {initials(assignTarget?.owner?.username || "?")}
//                   </div>
//                   <div>
//                     <div
//                       style={{
//                         fontSize: "13px",
//                         fontWeight: 600,
//                         color: "var(--text-primary)",
//                       }}
//                     >
//                       {assignTarget?.owner?.username || "—"}
//                     </div>
//                     <div
//                       style={{ fontSize: "11px", color: "var(--text-muted)" }}
//                     >
//                       {assignTarget?.owner?.email || "—"}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div
//                 style={{
//                   fontSize: "11px",
//                   fontWeight: 700,
//                   color: "var(--text-muted)",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.7px",
//                   marginBottom: "10px",
//                 }}
//               >
//                 Transfer To
//               </div>

//               <UserSearchPicker
//                 searchValue={assignForm.ownerSearch}
//                 selected={assignForm.ownerSelected}
//                 results={userResults}
//                 loading={userSearchLoading}
//                 onSearch={(q) => {
//                   setAssignForm((f) => ({
//                     ...f,
//                     ownerSearch: q,
//                     ownerSelected: null,
//                   }));
//                   searchUsers(q);
//                 }}
//                 onSelect={(user) => {
//                   setAssignForm((f) => ({
//                     ...f,
//                     ownerSelected: user,
//                     ownerSearch: user.username,
//                   }));
//                   setUserResults([]);
//                 }}
//                 placeholder="Search user by name or email..."
//               />

//               {assignForm.ownerSelected && (
//                 <div
//                   style={{
//                     marginTop: "12px",
//                     padding: "10px 14px",
//                     background: "var(--green-dim)",
//                     border: "1px solid var(--green)",
//                     borderRadius: "var(--radius-md)",
//                     fontSize: "13px",
//                     color: "var(--green)",
//                   }}
//                 >
//                   ✅ Will transfer to{" "}
//                   <strong>{assignForm.ownerSelected.username}</strong> (
//                   {assignForm.ownerSelected.email})
//                 </div>
//               )}
//             </div>
//             <ModalFooter
//               onCancel={closeModal}
//               onConfirm={handleAssignOwner}
//               loading={actionLoading}
//               confirmLabel="🔁 Transfer Ownership"
//               confirmStyle={{
//                 background: "var(--blue-dim)",
//                 border: "1px solid var(--blue)",
//                 color: "var(--blue)",
//               }}
//             />
//           </div>
//         </ModalBackdrop>
//       )}

//       {/* DELETE */}
//       {modal === "delete" && (
//         <ModalBackdrop onClose={closeModal}>
//           <div
//             className="modal animate-fadeup"
//             style={{ width: "380px", maxWidth: "95%", textAlign: "center" }}
//           >
//             <div style={{ padding: "32px 24px" }}>
//               <div style={{ fontSize: "40px", marginBottom: "14px" }}>🗑</div>
//               <h3
//                 style={{
//                   fontSize: "17px",
//                   fontWeight: 700,
//                   marginBottom: "10px",
//                 }}
//               >
//                 Delete Vendor?
//               </h3>
//               <p
//                 style={{
//                   fontSize: "13px",
//                   color: "var(--text-muted)",
//                   lineHeight: 1.6,
//                   marginBottom: "24px",
//                 }}
//               >
//                 You are about to permanently delete{" "}
//                 <strong style={{ color: "var(--text-primary)" }}>
//                   {deleteTarget?.name}
//                 </strong>
//                 . This action cannot be undone.
//               </p>
//               <div
//                 style={{
//                   display: "flex",
//                   gap: "10px",
//                   justifyContent: "center",
//                 }}
//               >
//                 <button
//                   className="btn-ghost"
//                   onClick={closeModal}
//                   style={{ padding: "9px 20px" }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   disabled={actionLoading}
//                   style={{
//                     background: "var(--red-dim)",
//                     border: "1px solid var(--red)",
//                     borderRadius: "var(--radius-md)",
//                     padding: "9px 20px",
//                     fontFamily: "var(--font-display)",
//                     fontSize: "13px",
//                     fontWeight: 700,
//                     color: "var(--red)",
//                     cursor: "pointer",
//                     transition: "all 0.2s",
//                     opacity: actionLoading ? 0.6 : 1,
//                   }}
//                 >
//                   {actionLoading ? "Deleting..." : "Delete Permanently"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </ModalBackdrop>
//       )}
//     </AppLayout>
//   );
// }

// /* ═══════════════════════════════════════════════
//    SUB-COMPONENTS
// ═══════════════════════════════════════════════ */

// function VendorRow({
//   vendor: v,
//   onView,
//   onEdit,
//   onToggle,
//   onDelete,
//   onAssign,
//   toggleLoading,
// }) {
//   return (
//     <tr onClick={onView} style={{ cursor: "pointer" }}>
//       <td>
//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           <div className={`user-avatar ${avatarClass(v._id)}`}>
//             {initials(v.name)}
//           </div>
//           <div>
//             <div className="td-primary">{v.name}</div>
//             <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
//               {v.owner?.username}
//             </div>
//           </div>
//         </div>
//       </td>
//       <td>
//         <div
//           style={{
//             fontSize: "12px",
//             fontWeight: 600,
//             color: "var(--text-primary)",
//           }}
//         >
//           {v.contact?.email}
//         </div>
//         <div className="td-mono" style={{ color: "var(--text-muted)" }}>
//           {v.contact?.mobile_no}
//         </div>
//       </td>
//       <td className="td-primary">
//         {v.address?.city}
//         {v.address?.area ? `, ${v.address.area}` : ""}
//       </td>
//       <td>
//         <div
//           style={{
//             fontSize: "12px",
//             fontWeight: 600,
//             color: "var(--text-primary)",
//           }}
//         >
//           {v.owner?.username || "—"}
//         </div>
//         <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
//           {v.owner?.email}
//         </div>
//       </td>
//       <td>
//         <span
//           className={`badge ${v.isActive ? "badge-active" : "badge-cancelled"}`}
//         >
//           {v.isActive ? "Active" : "Inactive"}
//         </span>
//       </td>
//       <td className="td-mono" style={{ fontSize: "11px" }}>
//         {fmtDate(v.createdAt)}
//       </td>
//       <td onClick={(e) => e.stopPropagation()}>
//         <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
//           <ActionBtn title="View" onClick={onView}>
//             👁
//           </ActionBtn>
//           <ActionBtn title="Edit" onClick={onEdit}>
//             ✏
//           </ActionBtn>
//           <ActionBtn
//             title="Assign Owner"
//             onClick={onAssign}
//             color="var(--blue)"
//           >
//             👤
//           </ActionBtn>
//           <ActionBtn
//             title={v.isActive ? "Deactivate" : "Activate"}
//             onClick={onToggle}
//             disabled={toggleLoading}
//             color={v.isActive ? "var(--red)" : "var(--green)"}
//           >
//             {toggleLoading ? "⏳" : v.isActive ? "⏸" : "▶"}
//           </ActionBtn>
//           <ActionBtn title="Delete" onClick={onDelete} color="var(--red)">
//             🗑
//           </ActionBtn>
//         </div>
//       </td>
//     </tr>
//   );
// }

// function ActionBtn({ children, title, onClick, color, disabled }) {
//   return (
//     <button
//       title={title}
//       onClick={onClick}
//       disabled={disabled}
//       style={{
//         background: "var(--bg-overlay)",
//         border: "1px solid var(--border-dim)",
//         borderRadius: "var(--radius-sm)",
//         padding: "6px 8px",
//         cursor: disabled ? "not-allowed" : "pointer",
//         fontSize: "13px",
//         color: color || "var(--text-secondary)",
//         transition: "all 0.15s",
//         display: "inline-flex",
//         alignItems: "center",
//         opacity: disabled ? 0.5 : 1,
//       }}
//       onMouseEnter={(e) => {
//         if (!disabled) {
//           e.currentTarget.style.background = "var(--bg-hover)";
//           e.currentTarget.style.borderColor = "var(--border-base)";
//         }
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.background = "var(--bg-overlay)";
//         e.currentTarget.style.borderColor = "var(--border-dim)";
//       }}
//     >
//       {children}
//     </button>
//   );
// }

// function ModalBackdrop({ children, onClose }) {
//   return (
//     <div
//       className="modal-overlay"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//       style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
//     >
//       {children}
//     </div>
//   );
// }

// function ModalFooter({
//   onCancel,
//   onConfirm,
//   loading,
//   confirmLabel,
//   confirmStyle,
// }) {
//   return (
//     <div
//       style={{
//         padding: "14px 20px",
//         borderTop: "1px solid var(--border-subtle)",
//         display: "flex",
//         gap: "10px",
//         justifyContent: "flex-end",
//       }}
//     >
//       <button
//         className="btn-ghost"
//         onClick={onCancel}
//         style={{ padding: "9px 18px" }}
//       >
//         Cancel
//       </button>
//       <button
//         className={confirmStyle ? "" : "btn-primary"}
//         onClick={onConfirm}
//         disabled={loading}
//         style={{
//           padding: "9px 18px",
//           borderRadius: "var(--radius-md)",
//           fontFamily: "var(--font-display)",
//           fontSize: "13px",
//           fontWeight: 700,
//           cursor: loading ? "not-allowed" : "pointer",
//           opacity: loading ? 0.6 : 1,
//           border: "none",
//           transition: "all 0.2s",
//           ...(confirmStyle || {}),
//         }}
//       >
//         {loading ? "Please wait..." : confirmLabel}
//       </button>
//     </div>
//   );
// }

// /* User search picker — reused by both Add and Assign modals */
// function UserSearchPicker({
//   searchValue,
//   selected,
//   results,
//   loading,
//   onSearch,
//   onSelect,
//   placeholder,
// }) {
//   return (
//     <div style={{ position: "relative" }}>
//       <div className="field">
//         <label className="field-label">Search User</label>
//         <div style={{ position: "relative" }}>
//           <input
//             className="field-input"
//             value={searchValue}
//             onChange={(e) => onSearch(e.target.value)}
//             placeholder={placeholder || "Search by username or email..."}
//             autoComplete="off"
//           />
//           {loading && (
//             <div
//               style={{
//                 position: "absolute",
//                 right: "12px",
//                 top: "50%",
//                 transform: "translateY(-50%)",
//               }}
//             >
//               <div
//                 className="spinner"
//                 style={{ width: "14px", height: "14px" }}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Dropdown results */}
//       {results.length > 0 && (
//         <div
//           style={{
//             position: "absolute",
//             top: "100%",
//             left: 0,
//             right: 0,
//             zIndex: 50,
//             background: "var(--bg-elevated)",
//             border: "1px solid var(--border-base)",
//             borderRadius: "var(--radius-md)",
//             overflow: "hidden",
//             boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
//             maxHeight: "220px",
//             overflowY: "auto",
//           }}
//         >
//           {results.map((u) => (
//             <div
//               key={u._id}
//               onClick={() => onSelect(u)}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 padding: "10px 14px",
//                 cursor: "pointer",
//                 transition: "background 0.15s",
//                 borderBottom: "1px solid var(--border-subtle)",
//               }}
//               onMouseEnter={(e) =>
//                 (e.currentTarget.style.background = "var(--bg-hover)")
//               }
//               onMouseLeave={(e) =>
//                 (e.currentTarget.style.background = "transparent")
//               }
//             >
//               <div
//                 className={`user-avatar ${avatarClass(u._id)}`}
//                 style={{
//                   width: "28px",
//                   height: "28px",
//                   fontSize: "10px",
//                   flexShrink: 0,
//                 }}
//               >
//                 {initials(u.username || u.email)}
//               </div>
//               <div>
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     fontWeight: 600,
//                     color: "var(--text-primary)",
//                   }}
//                 >
//                   {u.username}
//                 </div>
//                 <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
//                   {u.email}
//                 </div>
//               </div>
//               {u.mobile_no && (
//                 <div
//                   style={{
//                     marginLeft: "auto",
//                     fontSize: "11px",
//                     color: "var(--text-muted)",
//                     fontFamily: "var(--font-mono)",
//                   }}
//                 >
//                   {u.mobile_no}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function AddVendorForm({
//   form,
//   setForm,
//   userResults,
//   userSearchLoading,
//   onUserSearch,
//   onUserSelect,
// }) {
//   const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

//   return (
//     <div>
//       {/* Owner picker */}
//       <div
//         style={{
//           background: "var(--bg-overlay)",
//           border: "1px solid var(--border-dim)",
//           borderRadius: "var(--radius-md)",
//           padding: "14px",
//           marginBottom: "18px",
//         }}
//       >
//         <div
//           style={{
//             fontSize: "11px",
//             fontWeight: 700,
//             color: "var(--ember)",
//             textTransform: "uppercase",
//             letterSpacing: "0.7px",
//             marginBottom: "12px",
//           }}
//         >
//           👤 Owner (Required)
//         </div>
//         <UserSearchPicker
//           searchValue={form.ownerSearch}
//           selected={form.ownerSelected}
//           results={userResults}
//           loading={userSearchLoading}
//           onSearch={(q) => {
//             setForm((f) => ({
//               ...f,
//               ownerSearch: q,
//               ownerSelected: null,
//               ownerId: "",
//             }));
//             onUserSearch(q);
//           }}
//           onSelect={onUserSelect}
//           placeholder="Search user by username or email..."
//         />
//         {form.ownerSelected && (
//           <div
//             style={{
//               marginTop: "10px",
//               padding: "8px 12px",
//               background: "var(--green-dim)",
//               border: "1px solid var(--green)",
//               borderRadius: "var(--radius-sm)",
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//             }}
//           >
//             <span
//               style={{
//                 fontSize: "12px",
//                 color: "var(--green)",
//                 fontWeight: 600,
//               }}
//             >
//               ✅ {form.ownerSelected.username}
//             </span>
//             <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
//               {form.ownerSelected.email}
//             </span>
//             <button
//               onClick={() =>
//                 setForm((f) => ({
//                   ...f,
//                   ownerSelected: null,
//                   ownerSearch: "",
//                   ownerId: "",
//                 }))
//               }
//               style={{
//                 marginLeft: "auto",
//                 background: "none",
//                 border: "none",
//                 cursor: "pointer",
//                 color: "var(--red)",
//                 fontSize: "14px",
//               }}
//             >
//               ✕
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Vendor Name */}
//       <div className="field">
//         <label className="field-label">Vendor Name *</label>
//         <input
//           className="field-input"
//           value={form.name}
//           onChange={set("name")}
//           placeholder="e.g. Tiffinwala Express"
//         />
//       </div>

//       {/* Contact */}
//       <div className="grid-2" style={{ gap: "12px" }}>
//         <div className="field">
//           <label className="field-label">Email</label>
//           <input
//             className="field-input"
//             type="email"
//             value={form.email}
//             onChange={set("email")}
//             placeholder="vendor@email.com"
//           />
//         </div>
//         <div className="field">
//           <label className="field-label">Mobile</label>
//           <input
//             className="field-input"
//             value={form.mobile_no}
//             onChange={set("mobile_no")}
//             placeholder="+91 9999999999"
//           />
//         </div>
//       </div>

//       {/* Address */}
//       <div className="grid-2" style={{ gap: "12px" }}>
//         <div className="field">
//           <label className="field-label">Plot No</label>
//           <input
//             className="field-input"
//             value={form.plotNo}
//             onChange={set("plotNo")}
//             placeholder="12A"
//           />
//         </div>
//         <div className="field">
//           <label className="field-label">Street</label>
//           <input
//             className="field-input"
//             value={form.street}
//             onChange={set("street")}
//             placeholder="Main Street"
//           />
//         </div>
//       </div>
//       <div className="grid-2" style={{ gap: "12px" }}>
//         <div className="field">
//           <label className="field-label">Area</label>
//           <input
//             className="field-input"
//             value={form.area}
//             onChange={set("area")}
//             placeholder="Kothrud"
//           />
//         </div>
//         <div className="field">
//           <label className="field-label">City</label>
//           <input
//             className="field-input"
//             value={form.city}
//             onChange={set("city")}
//             placeholder="Pune"
//           />
//         </div>
//       </div>
//       <div className="grid-2" style={{ gap: "12px" }}>
//         <div className="field">
//           <label className="field-label">State</label>
//           <input
//             className="field-input"
//             value={form.state}
//             onChange={set("state")}
//             placeholder="Maharashtra"
//           />
//         </div>
//         <div className="field">
//           <label className="field-label">Pincode</label>
//           <input
//             className="field-input"
//             value={form.pincode}
//             onChange={set("pincode")}
//             placeholder="411038"
//           />
//         </div>
//       </div>

//       {/* Active toggle */}
//       <div
//         className="field"
//         style={{ display: "flex", alignItems: "center", gap: "12px" }}
//       >
//         <label className="field-label" style={{ margin: 0 }}>
//           Active
//         </label>
//         <label
//           style={{
//             position: "relative",
//             display: "inline-block",
//             width: "42px",
//             height: "22px",
//             cursor: "pointer",
//           }}
//         >
//           <input
//             type="checkbox"
//             checked={form.isActive}
//             onChange={(e) =>
//               setForm((f) => ({ ...f, isActive: e.target.checked }))
//             }
//             style={{ opacity: 0, width: 0, height: 0 }}
//           />
//           <span
//             style={{
//               position: "absolute",
//               inset: 0,
//               background: form.isActive
//                 ? "var(--green-dim)"
//                 : "var(--bg-active)",
//               border: `1px solid ${form.isActive ? "var(--green)" : "var(--border-base)"}`,
//               borderRadius: "22px",
//               transition: "0.2s",
//             }}
//           >
//             <span
//               style={{
//                 position: "absolute",
//                 width: "16px",
//                 height: "16px",
//                 left: form.isActive ? "22px" : "2px",
//                 top: "2px",
//                 background: form.isActive
//                   ? "var(--green)"
//                   : "var(--text-muted)",
//                 borderRadius: "50%",
//                 transition: "0.2s",
//               }}
//             />
//           </span>
//         </label>
//         <span
//           style={{
//             fontSize: "12px",
//             color: form.isActive ? "var(--green)" : "var(--text-muted)",
//           }}
//         >
//           {form.isActive ? "Active" : "Inactive"}
//         </span>
//       </div>
//     </div>
//   );
// }

// function EditVendorForm({ form, setForm }) {
//   const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
//   return (
//     <div>
//       <div className="field">
//         <label className="field-label">Vendor Name</label>
//         <input
//           className="field-input"
//           value={form.name}
//           onChange={set("name")}
//           placeholder="e.g. Tiffinwala Express"
//         />
//       </div>
//       <div className="grid-2" style={{ gap: "12px" }}>
//         <div className="field">
//           <label className="field-label">Email</label>
//           <input
//             className="field-input"
//             type="email"
//             value={form.email}
//             onChange={set("email")}
//             placeholder="vendor@email.com"
//           />
//         </div>
//         <div className="field">
//           <label className="field-label">Mobile</label>
//           <input
//             className="field-input"
//             value={form.mobile_no}
//             onChange={set("mobile_no")}
//             placeholder="+91 9999999999"
//           />
//         </div>
//       </div>
//       <div className="grid-2" style={{ gap: "12px" }}>
//         <div className="field">
//           <label className="field-label">City</label>
//           <input
//             className="field-input"
//             value={form.city}
//             onChange={set("city")}
//             placeholder="Pune"
//           />
//         </div>
//         <div className="field">
//           <label className="field-label">Area</label>
//           <input
//             className="field-input"
//             value={form.area}
//             onChange={set("area")}
//             placeholder="Kothrud"
//           />
//         </div>
//       </div>
//       <div className="field">
//         <label className="field-label">Street Address</label>
//         <input
//           className="field-input"
//           value={form.street}
//           onChange={set("street")}
//           placeholder="123 Main Street"
//         />
//       </div>
//       <div
//         className="field"
//         style={{ display: "flex", alignItems: "center", gap: "12px" }}
//       >
//         <label className="field-label" style={{ margin: 0 }}>
//           Active
//         </label>
//         <label
//           style={{
//             position: "relative",
//             display: "inline-block",
//             width: "42px",
//             height: "22px",
//             cursor: "pointer",
//           }}
//         >
//           <input
//             type="checkbox"
//             checked={form.isActive}
//             onChange={(e) =>
//               setForm((f) => ({ ...f, isActive: e.target.checked }))
//             }
//             style={{ opacity: 0, width: 0, height: 0 }}
//           />
//           <span
//             style={{
//               position: "absolute",
//               inset: 0,
//               background: form.isActive
//                 ? "var(--green-dim)"
//                 : "var(--bg-active)",
//               border: `1px solid ${form.isActive ? "var(--green)" : "var(--border-base)"}`,
//               borderRadius: "22px",
//               transition: "0.2s",
//             }}
//           >
//             <span
//               style={{
//                 position: "absolute",
//                 width: "16px",
//                 height: "16px",
//                 left: form.isActive ? "22px" : "2px",
//                 top: "2px",
//                 background: form.isActive
//                   ? "var(--green)"
//                   : "var(--text-muted)",
//                 borderRadius: "50%",
//                 transition: "0.2s",
//               }}
//             />
//           </span>
//         </label>
//         <span
//           style={{
//             fontSize: "12px",
//             color: form.isActive ? "var(--green)" : "var(--text-muted)",
//           }}
//         >
//           {form.isActive ? "Active" : "Inactive"}
//         </span>
//       </div>
//     </div>
//   );
// }

// function VendorDetail({
//   data,
//   onEdit,
//   onAssign,
//   onDeleteItem,
//   deleteItemLoadingId,
// }) {
//   const { vendor, stats, recentOrders = [] } = data;
//   if (!vendor) return null;

//   return (
//     <div>
//       {/* action buttons */}
//       <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
//         <button
//           className="btn-ghost"
//           onClick={onEdit}
//           style={{ padding: "7px 14px", fontSize: "12px" }}
//         >
//           ✏ Edit Vendor
//         </button>
//         <button
//           onClick={onAssign}
//           style={{
//             background: "var(--blue-dim)",
//             border: "1px solid var(--blue)",
//             borderRadius: "var(--radius-md)",
//             padding: "7px 14px",
//             fontFamily: "var(--font-display)",
//             fontSize: "12px",
//             fontWeight: 600,
//             color: "var(--blue)",
//             cursor: "pointer",
//           }}
//         >
//           👤 Reassign Owner
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="grid-3" style={{ marginBottom: "16px" }}>
//         {[
//           {
//             label: "Total Orders",
//             value: stats?.totalOrders ?? 0,
//             color: "var(--ember)",
//           },
//           {
//             label: "Revenue",
//             value: fmtRupee(stats?.totalRevenue),
//             color: "var(--green)",
//           },
//           {
//             label: "Status",
//             value: vendor.isActive ? "Active" : "Inactive",
//             color: vendor.isActive ? "var(--green)" : "var(--red)",
//           },
//         ].map((s, i) => (
//           <div
//             key={i}
//             className="metric-card"
//             style={{ padding: "14px", textAlign: "center" }}
//           >
//             <div
//               className="metric-value"
//               style={{ color: s.color, fontSize: "18px" }}
//             >
//               {s.value}
//             </div>
//             <div className="metric-label">{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Info grid */}
//       <div className="grid-2" style={{ marginBottom: "16px", gap: "10px" }}>
//         {[
//           { label: "Email", value: vendor.contact?.email },
//           { label: "Mobile", value: vendor.contact?.mobile_no },
//           { label: "City", value: vendor.address?.city },
//           { label: "Area", value: vendor.address?.area },
//           { label: "Street", value: vendor.address?.street },
//           { label: "Owner", value: vendor.owner?.username },
//           { label: "Joined", value: fmtDate(vendor.createdAt) },
//           { label: "Owner Email", value: vendor.owner?.email },
//         ].map((item, i) => (
//           <div
//             key={i}
//             style={{
//               background: "var(--bg-overlay)",
//               border: "1px solid var(--border-dim)",
//               borderRadius: "var(--radius-md)",
//               padding: "10px 14px",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: "10px",
//                 fontWeight: 600,
//                 color: "var(--text-muted)",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.6px",
//                 marginBottom: "4px",
//               }}
//             >
//               {item.label}
//             </div>
//             <div
//               style={{
//                 fontSize: "13px",
//                 fontWeight: 600,
//                 color: "var(--text-primary)",
//               }}
//             >
//               {item.value || "—"}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Menu Items */}
//       {vendor.items?.length > 0 && (
//         <>
//           <div className="nav-section-title" style={{ marginBottom: "8px" }}>
//             Menu Items ({vendor.items.length})
//           </div>
//           <div style={{ marginBottom: "16px" }}>
//             {vendor.items.map((item) => (
//               <div
//                 key={item._id}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   padding: "8px 12px",
//                   borderBottom: "1px solid var(--border-subtle)",
//                 }}
//               >
//                 <div>
//                   <div
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: 600,
//                       color: "var(--text-primary)",
//                     }}
//                   >
//                     {item.name}
//                   </div>
//                   <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
//                     {item.veg_or_nonveg}
//                   </div>
//                 </div>
//                 <div
//                   style={{ display: "flex", alignItems: "center", gap: "10px" }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: 700,
//                       color: "var(--ember)",
//                     }}
//                   >
//                     {fmtRupee(item.price)}
//                   </span>
//                   <button
//                     disabled={deleteItemLoadingId === item._id}
//                     onClick={() => onDeleteItem(vendor._id, item._id)}
//                     style={{
//                       background: "var(--red-dim)",
//                       border: "1px solid var(--red)",
//                       borderRadius: "var(--radius-sm)",
//                       padding: "3px 8px",
//                       cursor:
//                         deleteItemLoadingId === item._id
//                           ? "not-allowed"
//                           : "pointer",
//                       color: "var(--red)",
//                       fontSize: "11px",
//                       fontWeight: 600,
//                       opacity: deleteItemLoadingId === item._id ? 0.6 : 1,
//                     }}
//                   >
//                     {deleteItemLoadingId === item._id
//                       ? "Removing..."
//                       : "Remove"}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {/* Recent Orders */}
//       {recentOrders.length > 0 && (
//         <>
//           <div className="nav-section-title" style={{ marginBottom: "8px" }}>
//             Recent Orders
//           </div>
//           {recentOrders.map((o) => (
//             <div
//               key={o._id}
//               className="order-card compact"
//               style={{ marginBottom: "8px" }}
//             >
//               <div className="order-left">
//                 <div className="order-name">{o.user?.username || "User"}</div>
//                 <div className="order-sub">{o.user?.email}</div>
//               </div>
//               <div className="order-right">
//                 <span className={`status ${o.status}`}>{o.status}</span>
//                 <div className="order-time">{fmtDate(o.createdAt)}</div>
//               </div>
//             </div>
//           ))}
//         </>
//       )}
//     </div>
//   );
// }

import React, { useCallback, useEffect, useReducer, useState } from "react";
import AppLayout from "../components/AppLayout";
import { api } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

/* ═══════════════════════════════════════════════
   REDUCER
═══════════════════════════════════════════════ */
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
    case "TOGGLE_VENDOR_REQUEST":
      return { ...state, toggleLoadingId: action.payload };
    case "TOGGLE_VENDOR":
      return {
        ...state,
        vendors: state.vendors.map((v) =>
          v._id === action.payload ? { ...v, isActive: !v.isActive } : v,
        ),
      };
    case "TOGGLE_VENDOR_FINISH":
      return { ...state, toggleLoadingId: null };
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
    case "ADD_VENDOR":
      return { ...state, vendors: [action.payload, ...state.vendors] };
    case "ASSIGN_OWNER":
      return {
        ...state,
        vendors: state.vendors.map((v) =>
          v._id === action.payload._id ? action.payload : v,
        ),
      };
    case "DELETE_ITEM_REQUEST":
      return { ...state, deleteItemLoadingId: action.payload };
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
      return { ...state, deleteItemLoadingId: null };
    default:
      return state;
  }
};

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
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

/* ── Blank forms ── */
const BLANK_VENDOR_FORM = {
  name: "",
  email: "",
  mobile_no: "",
  plotNo: "",
  street: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  isActive: true,
};
const BLANK_USER_FORM = {
  username: "",
  email: "",
  mobile_no: "",
  password: "",
  confirmPassword: "",
};
const BLANK_ASSIGN_FORM = { ownerSearch: "", ownerSelected: null };

/* ── Add Vendor wizard steps ── */
const STEP = { USER: 1, VENDOR: 2 };

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
  const toast = useToast();

  /* ── list filters ── */
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  /* ── modal state ── */
  const [modal, setModal] = useState(null); // 'view'|'edit'|'delete'|'add'|'assign'
  const [editingVendor, setEditingVendor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* ── add wizard state ── */
  const [addStep, setAddStep] = useState(STEP.USER);
  const [createdUser, setCreatedUser] = useState(null); // user created in step 1
  const [userForm, setUserForm] = useState(BLANK_USER_FORM);
  const [vendorForm, setVendorForm] = useState(BLANK_VENDOR_FORM);
  const [editingVendorUser, setEditingVendorUser] = useState(null);
  const [userEditForm, setUserEditForm] = useState({
    username: "",
    email: "",
    mobile_no: "",
    isActive: true,
  });

  /* ── edit form ── */
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile_no: "",
    city: "",
    area: "",
    street: "",
    isActive: true,
  });

  /* ── assign owner ── */
  const [assignForm, setAssignForm] = useState(BLANK_ASSIGN_FORM);
  const [userResults, setUserResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  /* ───────── FETCH VENDORS ───────── */
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
      toast.error("Failed to load vendor details");
    }
  };

  /* ───────── SEARCH USERS (assign owner picker) ───────── */
  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUserResults([]);
      return;
    }
    try {
      setUserSearchLoading(true);
      const { data } = await api.get("/api/v1/admin/users", {
        params: { search: query, limit: 8 },
      });
      setUserResults(data.data || []);
    } catch {
      setUserResults([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

  /* ───────── TOGGLE ───────── */
  const handleToggle = async (vendor) => {
    try {
      dispatch({ type: "TOGGLE_VENDOR_REQUEST", payload: vendor._id });
      const response = await api.put(
        `/api/v1/admin/vendors/toggle/${vendor._id}`,
      );
      dispatch({ type: "TOGGLE_VENDOR", payload: vendor._id });
      const message =
        response.data.message ||
        (vendor.isActive ? "Vendor deactivated" : "Vendor activated");
      vendor.isActive ? toast.error(message) : toast.success(message);
    } catch {
      toast.error("Failed to update status");
    } finally {
      dispatch({ type: "TOGGLE_VENDOR_FINISH" });
    }
  };

  /* ───────── DELETE VENDOR ───────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/admin/vendors/${deleteTarget._id}`);
      dispatch({ type: "DELETE_VENDOR", payload: deleteTarget._id });
      toast.success("🗑 Vendor deleted permanently");
      closeModal();
    } catch {
      toast.error("Failed to delete vendor");
    } finally {
      setActionLoading(false);
    }
  };

  /* ───────── UPDATE VENDOR ───────── */
  const handleUpdate = async () => {
    if (!editingVendor) return;
    setActionLoading(true);
    try {
      const payload = {
        name: editForm.name,
        contact: { email: editForm.email, mobile_no: editForm.mobile_no },
        address: {
          city: editForm.city,
          area: editForm.area,
          street: editForm.street,
        },
        isActive: editForm.isActive,
      };
      const { data } = await api.put(
        `/api/v1/admin/vendors/${editingVendor._id}`,
        payload,
      );
      dispatch({ type: "UPDATE_VENDOR", payload: data.data });
      toast.success("✅ Vendor updated successfully");
      closeModal();
    } catch {
      toast.error("Failed to update vendor");
    } finally {
      setActionLoading(false);
    }
  };

  /* ───────── UPDATE VENDOR USER ───────── */
  const handleUpdateVendorUser = async () => {
    if (!editingVendorUser) return;

    setActionLoading(true);

    try {
      const { data } = await api.put(
        `/api/v1/admin/vendors/user/${editingVendorUser._id}`,
        {
          username: userEditForm.username,
          email: userEditForm.email,
          mobile_no: userEditForm.mobile_no,
          isActive: userEditForm.isActive,
        },
      );

      // update local vendor state
      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          ...state,
          data: vendors.map((v) =>
            v.owner?._id === editingVendorUser._id
              ? {
                  ...v,
                  owner: data.data,
                }
              : v,
          ),
          pagination,
        },
      });

      toast.success("✅ Vendor user updated successfully");

      closeModal();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update vendor user",
      );
    } finally {
      setActionLoading(false);
    }
  };
  /* ───────── STEP 1: CREATE VENDOR USER ───────── */
  const handleCreateUser = async () => {
    if (!userForm.username.trim()) return toast.error("Username is required");
    if (!userForm.email.trim()) return toast.error("Email is required");
    if (!userForm.password) return toast.error("Password is required");
    if (userForm.password !== userForm.confirmPassword)
      return toast.error("Passwords do not match");
    if (userForm.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setActionLoading(true);
    try {
      const { data } = await api.post("/api/v1/admin/vendors/user", {
        username: userForm.username,
        email: userForm.email,
        mobile_no: userForm.mobile_no,
        password: userForm.password,
      });
      setCreatedUser(data.data);
      toast.success(`✅ User "${data.data.username}" created as vendor_admin`);
      setAddStep(STEP.VENDOR);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create user");
    } finally {
      setActionLoading(false);
    }
  };

  /* ───────── STEP 2: CREATE VENDOR ───────── */
  const handleCreateVendor = async () => {
    if (!vendorForm.name.trim()) return toast.error("Vendor name is required");
    if (!createdUser)
      return toast.error("No owner user found, go back to step 1");

    setActionLoading(true);
    try {
      const payload = {
        name: vendorForm.name,
        ownerId: createdUser._id,
        contact: { email: vendorForm.email, mobile_no: vendorForm.mobile_no },
        address: {
          plotNo: vendorForm.plotNo,
          street: vendorForm.street,
          area: vendorForm.area,
          city: vendorForm.city,
          state: vendorForm.state,
          pincode: vendorForm.pincode,
        },
        isActive: vendorForm.isActive,
      };
      const { data } = await api.post("/api/v1/admin/vendors", payload);
      dispatch({ type: "ADD_VENDOR", payload: data.data });
      toast.success("🏪 Vendor created successfully");
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create vendor");
    } finally {
      setActionLoading(false);
    }
  };

  /* ───────── ASSIGN OWNER ───────── */
  const handleAssignOwner = async () => {
    if (!assignForm.ownerSelected)
      return toast.error("Please select a new owner");
    if (!assignTarget) return;
    setActionLoading(true);
    try {
      const { data } = await api.patch(
        `/api/v1/admin/vendors/${assignTarget._id}/assign-owner`,
        { newOwnerId: assignForm.ownerSelected._id },
      );
      dispatch({ type: "ASSIGN_OWNER", payload: data.data });
      toast.success(
        `✅ Owner reassigned to ${assignForm.ownerSelected.username}`,
      );
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reassign owner");
    } finally {
      setActionLoading(false);
    }
  };

  /* ───────── DELETE ITEM ───────── */
  const handleDeleteItem = async (vendorId, itemId) => {
    try {
      dispatch({ type: "DELETE_ITEM_REQUEST", payload: itemId });
      await api.delete(`/api/v1/admin/vendors/${vendorId}/item/${itemId}`);
      dispatch({ type: "DELETE_ITEM_SUCCESS", payload: itemId });
      toast.success("🗑 Menu item removed");
    } catch {
      dispatch({ type: "DELETE_ITEM_FAIL" });
      toast.error("Failed to remove item");
    }
  };

  /* ───────── MODAL HELPERS ───────── */
  const openView = (v) => {
    setModal("view");
    fetchVendorById(v._id);
  };
  const openEdit = (v) => {
    setEditingVendor(v);
    setEditForm({
      name: v.name || "",
      email: v.contact?.email || "",
      mobile_no: v.contact?.mobile_no || "",
      city: v.address?.city || "",
      area: v.address?.area || "",
      street: v.address?.street || "",
      isActive: v.isActive,
    });
    setModal("edit");
  };
  /* ───────── OPEN USER EDIT ───────── */
  const openUserEdit = (vendor) => {
    if (!vendor?.owner) {
      return toast.error("Vendor owner not found");
    }

    setEditingVendorUser(vendor.owner);

    setUserEditForm({
      username: vendor.owner.username || "",
      email: vendor.owner.email || "",
      mobile_no: vendor.owner.mobile_no || "",
      isActive: vendor.owner.isActive ?? true,
    });

    setModal("edit-user");
  };

  const openDelete = (v) => {
    setDeleteTarget(v);
    setModal("delete");
  };
  const openAdd = () => {
    setAddStep(STEP.USER);
    setCreatedUser(null);
    setUserForm(BLANK_USER_FORM);
    setVendorForm(BLANK_VENDOR_FORM);
    setModal("add");
  };
  const openAssign = (v) => {
    setAssignTarget(v);
    setAssignForm(BLANK_ASSIGN_FORM);
    setUserResults([]);
    setModal("assign");
  };
  const closeModal = () => {
    setModal(null);
    setEditingVendor(null);
    setDeleteTarget(null);
    setAssignTarget(null);
    setCreatedUser(null);
    setUserResults([]);
    dispatch({ type: "FETCH_VENDOR_SUCCESS", payload: null });
  };

  const activeCount = vendors.filter((v) => v.isActive).length;
  const inactiveCount = vendors.length - activeCount;

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <AppLayout>
      <div className="page-content">
        {/* ── HEADER ── */}
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
          <div>
            <button className="btn-primary" onClick={openAdd}>
              ＋ Add Vendor
            </button>
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

        {/* ── TABLE ── */}
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
                    <th>Owner</th>
                    <th>Vendor Status</th>
                    <th>Joined</th>
                    <th
                      style={{
                        minWidth: "400px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <VendorRow
                      key={v._id}
                      vendor={v}
                      onView={() => openView(v)}
                      onEdit={() => openEdit(v)}
                      onToggle={() => handleToggle(v)}
                      onDelete={() => openDelete(v)}
                      onAssign={() => openAssign(v)}
                      openUserEdit={() => openUserEdit(v)}
                      toggleLoading={toggleLoadingId === v._id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

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

      {/* ══════════════════════════════════════
          ADD VENDOR — 2-Step Wizard Modal
      ══════════════════════════════════════ */}
      {modal === "add" && (
        <ModalBackdrop onClose={closeModal}>
          <div
            className="modal animate-fadeup"
            style={{ width: "520px", maxWidth: "95%" }}
          >
            {/* Header */}
            <div className="modal-header">
              <div className="modal-header-left">
                <h3
                  className="order-id"
                  style={{ color: "var(--text-primary)" }}
                >
                  {addStep === STEP.USER
                    ? "Step 1 of 2 — Create Vendor User"
                    : "Step 2 of 2 — Create Vendor"}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {addStep === STEP.USER
                    ? "Register a new vendor_admin account"
                    : `Owner: ${createdUser?.username} (${createdUser?.email})`}
                </p>
              </div>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            {/* Step indicator */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              {[STEP.USER, STEP.VENDOR].map((s, i) => (
                <React.Fragment key={s}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      opacity: addStep >= s ? 1 : 0.4,
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 800,
                        background:
                          addStep > s
                            ? "var(--green)"
                            : addStep === s
                              ? "var(--ember)"
                              : "var(--bg-active)",
                        color: addStep >= s ? "#000" : "var(--text-muted)",
                      }}
                    >
                      {addStep > s ? "✓" : s}
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color:
                          addStep === s
                            ? "var(--ember-bright)"
                            : "var(--text-muted)",
                      }}
                    >
                      {s === STEP.USER ? "Create User" : "Create Vendor"}
                    </span>
                  </div>
                  {i === 0 && (
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background:
                          addStep > STEP.USER
                            ? "var(--green)"
                            : "var(--border-dim)",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Body */}
            <div className="modal-body">
              {addStep === STEP.USER ? (
                <CreateUserForm form={userForm} setForm={setUserForm} />
              ) : (
                <CreateVendorForm
                  form={vendorForm}
                  setForm={setVendorForm}
                  createdUser={createdUser}
                />
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                gap: "10px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                {addStep === STEP.VENDOR && (
                  <button
                    className="btn-ghost"
                    onClick={() => setAddStep(STEP.USER)}
                    style={{ padding: "9px 16px", fontSize: "12px" }}
                  >
                    ← Back
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-ghost"
                  onClick={closeModal}
                  style={{ padding: "9px 18px" }}
                >
                  Cancel
                </button>
                {addStep === STEP.USER ? (
                  <button
                    className="btn-primary"
                    onClick={handleCreateUser}
                    disabled={actionLoading}
                    style={{ padding: "9px 18px" }}
                  >
                    {actionLoading ? "Creating..." : "Create User →"}
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={handleCreateVendor}
                    disabled={actionLoading}
                    style={{ padding: "9px 18px" }}
                  >
                    {actionLoading ? "Creating..." : "🏪 Create Vendor"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* VIEW */}
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
                <VendorDetail
                  data={selectedVendor}
                  onEdit={() => {
                    closeModal();
                    openEdit(selectedVendor.vendor);
                  }}
                  onAssign={() => {
                    closeModal();
                    openAssign(selectedVendor.vendor);
                  }}
                  onDeleteItem={handleDeleteItem}
                  deleteItemLoadingId={deleteItemLoadingId}
                />
              ) : null}
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* EDIT */}
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
              <EditVendorForm form={editForm} setForm={setEditForm} />
            </div>
            <ModalFooter
              onCancel={closeModal}
              onConfirm={handleUpdate}
              loading={actionLoading}
              confirmLabel="💾 Save Changes"
            />
          </div>
        </ModalBackdrop>
      )}

      {/* ASSIGN OWNER */}
      {modal === "assign" && (
        <ModalBackdrop onClose={closeModal}>
          <div
            className="modal animate-fadeup"
            style={{ width: "420px", maxWidth: "95%" }}
          >
            <div className="modal-header">
              <div className="modal-header-left">
                <h3
                  className="order-id"
                  style={{ color: "var(--text-primary)" }}
                >
                  Assign New Owner
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Vendor:{" "}
                  <strong style={{ color: "var(--ember)" }}>
                    {assignTarget?.name}
                  </strong>
                </p>
              </div>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Current owner */}
              <div
                style={{
                  background: "var(--bg-overlay)",
                  border: "1px solid var(--border-dim)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 14px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    marginBottom: "6px",
                  }}
                >
                  Current Owner
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    className={`user-avatar ${avatarClass(assignTarget?._id || "")}`}
                    style={{ width: "32px", height: "32px", fontSize: "11px" }}
                  >
                    {initials(assignTarget?.owner?.username || "?")}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {assignTarget?.owner?.username || "—"}
                    </div>
                    <div
                      style={{ fontSize: "11px", color: "var(--text-muted)" }}
                    >
                      {assignTarget?.owner?.email || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                  marginBottom: "10px",
                }}
              >
                Transfer To
              </div>

              <UserSearchPicker
                searchValue={assignForm.ownerSearch}
                results={userResults}
                loading={userSearchLoading}
                onSearch={(q) => {
                  setAssignForm((f) => ({
                    ...f,
                    ownerSearch: q,
                    ownerSelected: null,
                  }));
                  searchUsers(q);
                }}
                onSelect={(user) => {
                  setAssignForm((f) => ({
                    ...f,
                    ownerSelected: user,
                    ownerSearch: user.username,
                  }));
                  setUserResults([]);
                }}
                placeholder="Search vendor_admin user..."
              />

              {assignForm.ownerSelected && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px 14px",
                    background: "var(--green-dim)",
                    border: "1px solid var(--green)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                    color: "var(--green)",
                  }}
                >
                  ✅ Will transfer to{" "}
                  <strong>{assignForm.ownerSelected.username}</strong> (
                  {assignForm.ownerSelected.email})
                </div>
              )}
            </div>
            <ModalFooter
              onCancel={closeModal}
              onConfirm={handleAssignOwner}
              loading={actionLoading}
              confirmLabel="🔁 Transfer Ownership"
              confirmStyle={{
                background: "var(--blue-dim)",
                border: "1px solid var(--blue)",
                color: "var(--blue)",
              }}
            />
          </div>
        </ModalBackdrop>
      )}

      {/* edit user */}
      {/* EDIT VENDOR USER */}
      {modal === "edit-user" && (
        <ModalBackdrop onClose={closeModal}>
          <div
            className="modal animate-fadeup"
            style={{ width: "460px", maxWidth: "95%" }}
          >
            <div className="modal-header">
              <div className="modal-header-left">
                <h3
                  className="order-id"
                  style={{ color: "var(--text-primary)" }}
                >
                  Edit Vendor User
                </h3>

                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  {editingVendorUser?.username}
                </p>
              </div>

              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <EditVendorUserForm
                form={userEditForm}
                setForm={setUserEditForm}
              />
            </div>

            <ModalFooter
              onCancel={closeModal}
              onConfirm={handleUpdateVendorUser}
              loading={actionLoading}
              confirmLabel="💾 Update User"
            />
          </div>
        </ModalBackdrop>
      )}

      {/* DELETE */}
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
                . This cannot be undone.
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
                    opacity: actionLoading ? 0.6 : 1,
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

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════ */

function EditVendorUserForm({ form, setForm }) {
  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: key === "isActive" ? e.target.checked : e.target.value,
    }));

  return (
    <div>
      <div className="field">
        <label className="field-label">Username</label>

        <input
          className="field-input"
          value={form.username}
          onChange={set("username")}
          placeholder="Enter username"
        />
      </div>

      <div className="grid-2" style={{ gap: "12px" }}>
        <div className="field">
          <label className="field-label">Email</label>

          <input
            type="email"
            className="field-input"
            value={form.email}
            onChange={set("email")}
            placeholder="Enter email"
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

      <ActiveToggle checked={form.isActive} onChange={set("isActive")} />
    </div>
  );
}

function VendorRow({
  vendor: v,
  onView,
  onEdit,
  onToggle,
  onDelete,
  onAssign,
  toggleLoading,
  openUserEdit,
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
      <td className="td-primary">
        {v.address?.city}
        {v.address?.area ? `, ${v.address.area}` : ""}
      </td>
      <td>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {v.owner?.username || "—"}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {v.owner?.email}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {v.owner?.isActive === false && (
            <span className="badge-cancelled">⚠️ Owner Inactive</span>
          )}
        </div>
      </td>
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
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          <ActionBtn title="View" onClick={onView}>
            view vendor
          </ActionBtn>
          <ActionBtn title="Edit" onClick={onEdit}>
            edit vendor
          </ActionBtn>
          <ActionBtn
            title="Assign Owner"
            onClick={onAssign}
            color="var(--blue)"
          >
            Assign New Owner
          </ActionBtn>
          <ActionBtn
            title="Edit User"
            onClick={() => openUserEdit(v)}
            color="var(--ember)"
          >
            update Owner
          </ActionBtn>
          <ActionBtn
            title={v.isActive ? "Deactivate" : "Activate"}
            onClick={onToggle}
            disabled={toggleLoading}
            color={v.isActive ? "var(--red)" : "var(--green)"}
          >
            {toggleLoading
              ? "⏳"
              : v.isActive
                ? "Deactivate Vendor"
                : "Activate Vendor"}
          </ActionBtn>
          <ActionBtn title="Delete" onClick={onDelete} color="var(--red)">
            🗑 Delete Vendor
          </ActionBtn>
        </div>
      </td>
    </tr>
  );
}

function ActionBtn({ children, title, onClick, color, disabled }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "var(--bg-overlay)",
        border: "1px solid var(--border-dim)",
        borderRadius: "var(--radius-sm)",
        padding: "6px 8px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "13px",
        color: color || "var(--text-secondary)",
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "var(--bg-hover)";
          e.currentTarget.style.borderColor = "var(--border-base)";
        }
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

function ModalFooter({
  onCancel,
  onConfirm,
  loading,
  confirmLabel,
  confirmStyle,
}) {
  return (
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
        onClick={onCancel}
        style={{ padding: "9px 18px" }}
      >
        Cancel
      </button>
      <button
        className={confirmStyle ? "" : "btn-primary"}
        onClick={onConfirm}
        disabled={loading}
        style={{
          padding: "9px 18px",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-display)",
          fontSize: "13px",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          border: "none",
          transition: "all 0.2s",
          ...(confirmStyle || {}),
        }}
      >
        {loading ? "Please wait..." : confirmLabel}
      </button>
    </div>
  );
}

/* ── Toggle switch shared ── */
function ActiveToggle({ checked, onChange }) {
  return (
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
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: checked ? "var(--green-dim)" : "var(--bg-active)",
            border: `1px solid ${checked ? "var(--green)" : "var(--border-base)"}`,
            borderRadius: "22px",
            transition: "0.2s",
          }}
        >
          <span
            style={{
              position: "absolute",
              width: "16px",
              height: "16px",
              left: checked ? "22px" : "2px",
              top: "2px",
              background: checked ? "var(--green)" : "var(--text-muted)",
              borderRadius: "50%",
              transition: "0.2s",
            }}
          />
        </span>
      </label>
      <span
        style={{
          fontSize: "12px",
          color: checked ? "var(--green)" : "var(--text-muted)",
        }}
      >
        {checked ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

/* ── Step 1: Create vendor_admin user ── */
function CreateUserForm({ form, setForm }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const [showPw, setShowPw] = useState(false);
  return (
    <div>
      <div
        style={{
          background: "var(--ember-glow)",
          border: "1px solid var(--ember-dim)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          marginBottom: "18px",
          fontSize: "12px",
          color: "var(--ember-bright)",
        }}
      >
        💡 This creates a <strong>vendor_admin</strong> account. You'll set up
        their vendor profile in the next step.
      </div>
      <div className="field">
        <label className="field-label">Username *</label>
        <input
          className="field-input"
          value={form.username}
          onChange={set("username")}
          placeholder="e.g. rahul_vendor"
        />
      </div>
      <div className="grid-2" style={{ gap: "12px" }}>
        <div className="field">
          <label className="field-label">Email *</label>
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
          <label className="field-label">Password *</label>
          <div style={{ position: "relative" }}>
            <input
              className="field-input"
              type="text"
              value={form.password}
              onChange={set("password")}
              placeholder="Min 6 characters"
            />
          </div>
        </div>
        <div className="field">
          <label className="field-label">Confirm Password *</label>
          <input
            className="field-input"
            type={showPw ? "text" : "password"}
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            placeholder="Repeat password"
          />
        </div>
      </div>
      {form.password &&
        form.confirmPassword &&
        form.password !== form.confirmPassword && (
          <div
            style={{
              fontSize: "12px",
              color: "var(--red)",
              marginTop: "-8px",
              marginBottom: "12px",
            }}
          >
            ⚠ Passwords do not match
          </div>
        )}
    </div>
  );
}

/* ── Step 2: Create vendor profile ── */
function CreateVendorForm({ form, setForm, createdUser }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div>
      {/* Owner confirmation banner */}
      <div
        style={{
          background: "var(--green-dim)",
          border: "1px solid var(--green)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          className={`user-avatar ${avatarClass(createdUser?._id || "new")}`}
          style={{
            width: "30px",
            height: "30px",
            fontSize: "11px",
            flexShrink: 0,
          }}
        >
          {initials(createdUser?.username || "?")}
        </div>
        <div>
          <div
            style={{ fontSize: "12px", fontWeight: 700, color: "var(--green)" }}
          >
            ✅ Owner Ready
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {createdUser?.username} · {createdUser?.email}
          </div>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Vendor Name *</label>
        <input
          className="field-input"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Tiffinwala Express"
        />
      </div>
      <div className="grid-2" style={{ gap: "12px" }}>
        <div className="field">
          <label className="field-label">Vendor Email</label>
          <input
            className="field-input"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="vendor@email.com"
          />
        </div>
        <div className="field">
          <label className="field-label">Vendor Mobile</label>
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
          <label className="field-label">Plot No</label>
          <input
            className="field-input"
            value={form.plotNo}
            onChange={set("plotNo")}
            placeholder="12A"
          />
        </div>
        <div className="field">
          <label className="field-label">Street</label>
          <input
            className="field-input"
            value={form.street}
            onChange={set("street")}
            placeholder="Main Street"
          />
        </div>
      </div>
      <div className="grid-2" style={{ gap: "12px" }}>
        <div className="field">
          <label className="field-label">Area</label>
          <input
            className="field-input"
            value={form.area}
            onChange={set("area")}
            placeholder="Kothrud"
          />
        </div>
        <div className="field">
          <label className="field-label">City</label>
          <input
            className="field-input"
            value={form.city}
            onChange={set("city")}
            placeholder="Pune"
          />
        </div>
      </div>
      <div className="grid-2" style={{ gap: "12px" }}>
        <div className="field">
          <label className="field-label">State</label>
          <input
            className="field-input"
            value={form.state}
            onChange={set("state")}
            placeholder="Maharashtra"
          />
        </div>
        <div className="field">
          <label className="field-label">Pincode</label>
          <input
            className="field-input"
            value={form.pincode}
            onChange={set("pincode")}
            placeholder="411038"
          />
        </div>
      </div>
      <ActiveToggle
        checked={form.isActive}
        onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
      />
    </div>
  );
}

/* ── Edit vendor form ── */
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
      <ActiveToggle
        checked={form.isActive}
        onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
      />
    </div>
  );
}

/* ── User search picker (assign modal) ── */
function UserSearchPicker({
  searchValue,
  results,
  loading,
  onSearch,
  onSelect,
  placeholder,
}) {
  return (
    <div style={{ position: "relative" }}>
      <div className="field">
        <label className="field-label">Search User</label>
        <div style={{ position: "relative" }}>
          <input
            className="field-input"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder || "Search by username or email..."}
            autoComplete="off"
          />
          {loading && (
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <div
                className="spinner"
                style={{ width: "14px", height: "14px" }}
              />
            </div>
          )}
        </div>
      </div>
      {results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-base)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {results.map((u) => (
            <div
              key={u._id}
              onClick={() => onSelect(u)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                cursor: "pointer",
                transition: "background 0.15s",
                borderBottom: "1px solid var(--border-subtle)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                className={`user-avatar ${avatarClass(u._id)}`}
                style={{
                  width: "28px",
                  height: "28px",
                  fontSize: "10px",
                  flexShrink: 0,
                }}
              >
                {initials(u.username || u.email)}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {u.username}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {u.email}
                </div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: "10px",
                  color:
                    u.user_type === "vendor_admin"
                      ? "var(--ember)"
                      : "var(--text-muted)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {u.user_type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Vendor detail (view modal) ── */
function VendorDetail({
  data,
  onEdit,
  onAssign,
  onDeleteItem,
  deleteItemLoadingId,
}) {
  const { vendor, stats, recentOrders = [] } = data;
  if (!vendor) return null;
  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          className="btn-ghost"
          onClick={onEdit}
          style={{ padding: "7px 14px", fontSize: "12px" }}
        >
          ✏ Edit Vendor
        </button>
        <button
          onClick={onAssign}
          style={{
            background: "var(--blue-dim)",
            border: "1px solid var(--blue)",
            borderRadius: "var(--radius-md)",
            padding: "7px 14px",
            fontFamily: "var(--font-display)",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--blue)",
            cursor: "pointer",
          }}
        >
          👤 Reassign Owner
        </button>
      </div>
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
      {vendor.items?.length > 0 && (
        <>
          <div className="nav-section-title" style={{ marginBottom: "8px" }}>
            Menu Items ({vendor.items.length})
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
                    {item.veg_or_nonveg}
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
