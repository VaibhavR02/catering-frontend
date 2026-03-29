// import { useEffect, useState } from "react";
// import AppLayout from "../components/AppLayout";
// import { useAuth, api } from "../contexts/AuthContext";

// function Modal({ title, children, onClose }) {
//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         <div className="modal-header">
//           <h3>{title}</h3>
//           <button className="close-btn" onClick={onClose}>
//             ✕
//           </button>
//         </div>
//         <div className="modal-body">{children}</div>
//       </div>
//     </div>
//   );
// }

// export default function UserProfile() {
//   const { user } = useAuth();
//   const [modal, setModal] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [societies, setSocieties] = useState([]);
//   const [loadingSoc, setLoadingSoc] = useState(true);
//   const [form, setForm] = useState({
//     username: user?.username || "",
//     mobile_no: user?.mobile_no || "",
//     email: user?.email || "",
//     company_name: user?.company?.name || "",
//     society_name: user?.company?.address?.society_name || "",
//     society_id: user?.company?.address?.society_id || "",
//     tower: user?.company?.address?.tower || "",
//     floor: user?.company?.address?.floor || "",
//     id_type: user?.id_proof?.id_type || "",
//     image: user?.id_proof?.image || "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   useEffect(() => {
//     api
//       .get("/api/v1/societies")
//       .then(({ data }) => setSocieties(data.data || []))
//       .catch(() => alert("Failed to load societies"))
//       .finally(() => setLoadingSoc(false));
//   }, []);

//   const updateProfile = async () => {
//     try {
//       setLoading(true);
//       await api.patch("/api/v1/users/update-profile", form);
//       setModal(null);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) {
//     return (
//       <AppLayout>
//         <div style={{ padding: 40 }}>Loading profile...</div>
//       </AppLayout>
//     );
//   }

//   return (
//     <AppLayout>
//       {/* HEADER */}
//       <div className="profile-card">
//         <div className="profile-avatar">
//           {user.username?.charAt(0)?.toUpperCase()}
//         </div>

//         <div className="profile-info">
//           <h2>{user.username}</h2>
//           <p>{user.email}</p>
//           <span className={`badge badge-${user.user_type}`}>
//             {user.user_type}
//           </span>
//         </div>

//         <button className="btn-edit" onClick={() => setModal("profile")}>
//           Edit
//         </button>
//       </div>

//       {/* CONTACT */}
//       <div className="panel">
//         <div className="panel-header">
//           <div className="panel-title">Contact Information</div>
//           <button className="btn-edit" onClick={() => setModal("contact")}>
//             Edit
//           </button>
//         </div>

//         <div className="profile-grid">
//           <div>
//             <label>Mobile</label>
//             <p>{user.mobile_no || "Not provided"}</p>
//           </div>

//           <div>
//             <label>Email</label>
//             <p>{user.email}</p>
//           </div>
//         </div>
//       </div>

//       {/* COMPANY */}
//       <div className="panel">
//         <div className="panel-header">
//           <div className="panel-title">Company Details</div>
//           <button className="btn-edit" onClick={() => setModal("company")}>
//             Edit
//           </button>
//         </div>

//         <div className="profile-grid">
//           <div>
//             <label>Company</label>
//             <p>{user.company?.name || "—"}</p>
//           </div>
//           <div>
//             <label>Society</label>
//             <p>{user.company?.address?.society_name || "—"}</p>
//           </div>
//           <div>
//             <label>Tower</label>
//             <p>{user.company?.address?.tower || "—"}</p>
//           </div>
//           <div>
//             <label>Floor</label>
//             <p>{user.company?.address?.floor || "—"}</p>
//           </div>
//         </div>
//       </div>

//       {/* VERIFICATION */}
//       <div className="panel">
//         <div className="panel-header">
//           <div className="panel-title">Verification</div>
//         </div>

//         <div className="profile-grid">
//           <div>
//             <label>Status</label>
//             <span
//               className={`badge ${user.verification_status?.is_verified ? "badge-success" : "badge-pending"}`}
//             >
//               {user.verification_status?.is_verified ? "Verified" : "Pending"}
//             </span>
//           </div>

//           <div>
//             <label>Remark</label>
//             <p>{user.verification_status?.Remark || "—"}</p>
//           </div>
//         </div>
//       </div>

//       {/* ID PROOF */}
//       <div className="panel">
//         <div className="panel-header">
//           <div className="panel-title">ID Proof</div>
//           <button className="btn-edit" onClick={() => setModal("idproof")}>
//             Edit
//           </button>
//         </div>

//         <div className="profile-grid">
//           <div>
//             <label>ID Type</label>
//             <p>{user.id_proof?.id_type || "—"}</p>
//           </div>

//           {user.id_proof?.image && (
//             <img src={user.id_proof.image} alt="ID" className="preview-img" />
//           )}
//         </div>
//       </div>

//       {/* MODALS */}

//       {modal === "profile" && (
//         <Modal title="Edit Profile" onClose={() => setModal(null)}>
//           <input
//             className="form-input"
//             name="username"
//             value={form.username}
//             onChange={handleChange}
//             placeholder="Name"
//           />
//           <button className="btn-primary" onClick={updateProfile}>
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </Modal>
//       )}

//       {modal === "contact" && (
//         <Modal title="Edit Contact" onClose={() => setModal(null)}>
//           <input
//             className="form-input"
//             name="mobile_no"
//             value={form.mobile_no}
//             onChange={handleChange}
//             placeholder="Mobile"
//           />
//           <input
//             className="form-input"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             placeholder="Email"
//           />
//           <button className="btn-primary" onClick={updateProfile}>
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </Modal>
//       )}

//       {/* {modal === "company" && (
//         <Modal title="Edit Company" onClose={() => setModal(null)}>
//           <input
//             className="form-input"
//             name="company_name"
//             value={form.company_name}
//             onChange={handleChange}
//             placeholder="Company"
//           />

//  onSelectSociety={(society) => {
//   setForm({
//     ...form,
//     society_name: society.name,
//     society_id: society._id
//   });
// }}
//           <input
//             className="form-input"
//             name="tower"
//             value={form.tower}
//             onChange={handleChange}
//             placeholder="Tower"
//           />
//           <input
//             className="form-input"
//             name="floor"
//             value={form.floor}
//             onChange={handleChange}
//             placeholder="Floor"
//           />
//           <button className="btn-primary" onClick={updateProfile}>
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </Modal>
//       )} */}

//       {modal === "company" && (
//         <Modal title="Edit Company" onClose={() => setModal(null)}>
//           {/* ✅ SOCIETY DROPDOWN */}
//           {loadingSoc ? (
//             <p>Loading societies...</p>
//           ) : (
//             <select
//               className="form-input"
//               value={form.society_id || ""}
//               onChange={(e) => {
//                 const selected = societies.find(
//                   (s) => s._id === e.target.value,
//                 );

//                 setForm({
//                   ...form,
//                   society_id: selected?._id || "",
//                   society_name: selected?.name || "",
//                 });
//               }}
//             >
//               <option value="">Select Society</option>

//               {societies.map((society) => (
//                 <option key={society._id} value={society._id}>
//                   {society.name}
//                 </option>
//               ))}
//             </select>
//           )}
//           {/* OPTIONAL: show selected */}
//           {form.society_name && (
//             <p style={{ fontSize: 12, color: "#666" }}>
//               Selected: {form.society_name}
//             </p>
//           )}
//           <input
//             className="form-input"
//             name="company_name"
//             value={form.company_name}
//             onChange={handleChange}
//             placeholder="Company"
//           />

//           <input
//             className="form-input"
//             name="tower"
//             value={form.tower}
//             onChange={handleChange}
//             placeholder="Tower"
//           />

//           <input
//             className="form-input"
//             name="floor"
//             value={form.floor}
//             onChange={handleChange}
//             placeholder="Floor"
//           />

//           <button className="btn-primary" onClick={updateProfile}>
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </Modal>
//       )}

//       {modal === "idproof" && (
//         <Modal title="Edit ID Proof" onClose={() => setModal(null)}>
//           <input
//             className="form-input"
//             name="id_type"
//             value={form.id_type}
//             onChange={handleChange}
//             placeholder="ID Type"
//           />
//           <input
//             className="form-input"
//             name="image"
//             value={form.image}
//             onChange={handleChange}
//             placeholder="Image URL"
//           />

//           {form.image && (
//             <img src={form.image} alt="preview" className="preview-img" />
//           )}

//           <button className="btn-primary" onClick={updateProfile}>
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </Modal>
//       )}
//     </AppLayout>
//   );
// }

import { useEffect, useReducer } from "react";
import AppLayout from "../components/AppLayout";
import { useAuth, api } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

// ── STATE ─────────────────────────────────────────────
const initialState = {
  fetchLoading: false,
  fetchError: null,
  societies: [],
  profileUser: null, // ← add this

  updateLoading: false,
  updateError: null,
  modal: null,
  form: {},
};

// ── ACTIONS ───────────────────────────────────────────
const A = {
  FETCH_REQUEST: "FETCH_REQUEST",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_FAIL: "FETCH_FAIL",

  PROFILE_FETCH_SUCCESS: "PROFILE_FETCH_SUCCESS", // ← add this

  UPDATE_REQUEST: "UPDATE_REQUEST",
  UPDATE_SUCCESS: "UPDATE_SUCCESS",
  UPDATE_FAIL: "UPDATE_FAIL",

  SET_FORM: "SET_FORM",
  SET_MODAL: "SET_MODAL",
};

// ── REDUCER ───────────────────────────────────────────
function reducer(state, { type, payload }) {
  switch (type) {
    case A.FETCH_REQUEST:
      return { ...state, fetchLoading: true, fetchError: null };
    case A.FETCH_SUCCESS:
      return { ...state, fetchLoading: false, societies: payload };
    case A.FETCH_FAIL:
      return { ...state, fetchLoading: false, fetchError: payload };

    case A.UPDATE_REQUEST:
      return { ...state, updateLoading: true, updateError: null };
    case A.UPDATE_SUCCESS:
      return { ...state, updateLoading: false, modal: null };
    case A.UPDATE_FAIL:
      return { ...state, updateLoading: false, updateError: payload };

    case A.SET_FORM:
      return { ...state, form: { ...state.form, ...payload } };
    case A.SET_MODAL:
      return { ...state, modal: payload };

    case A.PROFILE_FETCH_SUCCESS:
      return { ...state, profileUser: payload };

    default:
      return state;
  }
}

// ── MODAL WRAPPER ─────────────────────────────────────
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── COMPONENT ─────────────────────────────────────────
export default function UserProfile() {
  const { user } = useAuth();

  const toast = useToast();

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    form: {
      username: user?.username || "",
      mobile_no: user?.mobile_no || "",
      email: user?.email || "",
      company_name: user?.company?.name || "",
      society_name: user?.company?.address?.society_name || "",
      society_id: user?.company?.address?.society_id || "",
      tower: user?.company?.address?.tower || "",
      floor: user?.company?.address?.floor || "",
      id_type: user?.id_proof?.id_type || "",
      image: user?.id_proof?.image || "",
    },
  });

  const {
    fetchLoading,
    fetchError,
    societies,
    updateLoading,
    updateError,
    modal,
    form,
  } = state;
  const displayUser = state.profileUser || user;
  // ── Helpers ──
  const setForm = (payload) => dispatch({ type: A.SET_FORM, payload });
  const setModal = (payload) => dispatch({ type: A.SET_MODAL, payload });
  const handle = (e) => setForm({ [e.target.name]: e.target.value });

  // ── Fetch societies ──
  useEffect(() => {
    dispatch({ type: A.FETCH_REQUEST });
    api
      .get("/api/v1/societies")
      .then(({ data }) =>
        dispatch({ type: A.FETCH_SUCCESS, payload: data.data || [] }),
      )
      .catch((err) => {
        dispatch({
          type: A.FETCH_FAIL,
          payload: err?.response?.data?.message || "Failed to load societies",
        });
        toast.error("Failed to load societies");
      });
  }, []);

  // ── Update profile ──
  // const updateProfile = async () => {
  //   dispatch({ type: A.UPDATE_REQUEST });
  //   try {
  //     await api.patch("/api/v1/users/update-profile", form);
  //     dispatch({ type: A.UPDATE_SUCCESS });
  //     toast.success("Profile updated successfully");
  //   } catch (err) {
  //     const msg = err?.response?.data?.message || "Failed to update profile";
  //     dispatch({ type: A.UPDATE_FAIL, payload: msg });
  //     toast.error(msg);
  //   }
  // };

  const updateProfile = async () => {
    dispatch({ type: A.UPDATE_REQUEST });
    try {
      const { data } = await api.patch("/api/v1/users/update-profile", form);

      dispatch({ type: A.UPDATE_SUCCESS });

      // ✅ feed updated user into profileUser state
      dispatch({ type: A.PROFILE_FETCH_SUCCESS, payload: data.data });

      toast.success("Profile updated successfully");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      dispatch({ type: A.UPDATE_FAIL, payload: msg });
      toast.error(msg);
    }
  };

  // ── Save button shared across all modals ──
  const SaveBtn = () => (
    <>
      {updateError && (
        <p style={{ color: "var(--red)", fontSize: 12, marginBottom: 8 }}>
          ⚠️ {updateError}
        </p>
      )}
      <button
        className="btn-primary"
        onClick={updateProfile}
        disabled={updateLoading}
      >
        {updateLoading ? (
          <>
            <span
              className="spinner"
              style={{ width: 14, height: 14, borderWidth: 2 }}
            />{" "}
            Saving…
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </>
  );

  if (!user) {
    return (
      <AppLayout>
        <div className="page-loader" style={{ height: "60vh" }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="profile-card">
        <div className="profile-avatar">
          {displayUser.username?.charAt(0)?.toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{displayUser.username}</h2>
          <p>{displayUser.email}</p>
          <span className={`badge badge-${displayUser.user_type}`}>
            {displayUser.user_type}
          </span>
        </div>
        <button className="btn-edit" onClick={() => setModal("profile")}>
          Edit
        </button>
      </div>

      {/* CONTACT */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Contact Information</div>
          <button className="btn-edit" onClick={() => setModal("contact")}>
            Edit
          </button>
        </div>
        <div className="profile-grid">
          <div>
            <label>Mobile</label>
            <p>{displayUser.mobile_no || "Not provided"}</p>
          </div>
          <div>
            <label>Email</label>
            <p>{displayUser.email}</p>
          </div>
        </div>
      </div>

      {/* COMPANY */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Company Details</div>
          <button className="btn-edit" onClick={() => setModal("company")}>
            Edit
          </button>
        </div>
        <div className="profile-grid">
          <div>
            <label>Company</label>
            <p>{displayUser.company?.name || "—"}</p>
          </div>
          <div>
            <label>Society</label>
            <p>{displayUser.company?.address?.society_name || "—"}</p>
          </div>
          <div>
            <label>Tower</label>
            <p>{displayUser.company?.address?.tower || "—"}</p>
          </div>
          <div>
            <label>Floor</label>
            <p>{displayUser.company?.address?.floor || "—"}</p>
          </div>
        </div>
      </div>

      {/* VERIFICATION */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Verification</div>
        </div>
        <div className="profile-grid">
          <div>
            <label>Status</label>
            <span
              className={`badge ${displayUser.verification_status?.is_verified ? "badge-active" : "badge-pending"}`}
            >
              {displayUser.verification_status?.is_verified
                ? "Verified"
                : "Pending"}
            </span>
          </div>
          <div>
            <label>Remark</label>
            <p>{displayUser.verification_status?.Remark || "—"}</p>
          </div>
        </div>
      </div>

      {/* ID PROOF */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">ID Proof</div>
          <button className="btn-edit" onClick={() => setModal("idproof")}>
            Edit
          </button>
        </div>
        <div className="profile-grid">
          <div>
            <label>ID Type</label>
            <p>{displayUser.id_proof?.id_type || "—"}</p>
          </div>
          {displayUser.id_proof?.image && (
            <img
              src={displayUser.id_proof.image}
              alt="ID"
              className="id-preview"
              style={{ width: 100, borderRadius: 6, marginTop: 10 }}
            />
          )}
        </div>
      </div>

      {/* ── MODALS ── */}

      {modal === "profile" && (
        <Modal title="Edit Profile" onClose={() => setModal(null)}>
          <input
            className="field-input"
            name="username"
            value={form.username}
            onChange={handle}
            placeholder="Name"
          />
          <SaveBtn />
        </Modal>
      )}

      {modal === "contact" && (
        <Modal title="Edit Contact" onClose={() => setModal(null)}>
          <input
            className="field-input"
            name="mobile_no"
            value={form.mobile_no}
            onChange={handle}
            placeholder="Mobile"
          />
          <input
            className="field-input"
            name="email"
            value={form.email}
            onChange={handle}
            placeholder="Email"
          />
          <SaveBtn />
        </Modal>
      )}

      {modal === "company" && (
        <Modal title="Edit Company" onClose={() => setModal(null)}>
          {fetchLoading ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Loading societies...
            </p>
          ) : fetchError ? (
            <p style={{ color: "var(--red)", fontSize: 13 }}>⚠️ {fetchError}</p>
          ) : (
            <select
              className="field-input"
              value={form.society_id || ""}
              onChange={(e) => {
                const selected = societies.find(
                  (s) => s._id === e.target.value,
                );
                setForm({
                  society_id: selected?._id || "",
                  society_name: selected?.name || "",
                });
              }}
            >
              <option value="">Select Society</option>
              {societies.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          {form.society_name && (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 8,
              }}
            >
              Selected: {form.society_name}
            </p>
          )}
          <input
            className="field-input"
            name="company_name"
            value={form.company_name}
            onChange={handle}
            placeholder="Company Name"
          />
          <input
            className="field-input"
            name="tower"
            value={form.tower}
            onChange={handle}
            placeholder="Tower"
          />
          <input
            className="field-input"
            name="floor"
            value={form.floor}
            onChange={handle}
            placeholder="Floor"
          />
          <SaveBtn />
        </Modal>
      )}

      {modal === "idproof" && (
        <Modal title="Edit ID Proof" onClose={() => setModal(null)}>
          <input
            className="field-input"
            name="id_type"
            value={form.id_type}
            onChange={handle}
            placeholder="ID Type (e.g. Aadhar, PAN)"
          />
          <input
            className="field-input"
            name="image"
            value={form.image}
            onChange={handle}
            placeholder="Image URL"
          />
          {form.image && (
            <img
              src={form.image}
              alt="preview"
              style={{ width: 100, borderRadius: 6, marginTop: 8 }}
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <SaveBtn />
        </Modal>
      )}
    </AppLayout>
  );
}
