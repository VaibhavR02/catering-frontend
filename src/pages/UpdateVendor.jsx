// import React, { useState } from "react";
// import AppLayout from "../components/AppLayout";

// const INITIAL_STATE = {
//   name: "Spice Garden",
//   contact: { mobile_no: "9876543210", email: "spicegarden@gmail.com" },
//   address: {
//     plotNo: "12A",
//     street: "MG Road",
//     area: "Koregaon Park",
//     city: "Pune",
//     state: "Maharashtra",
//     pincode: "411001",
//   },
//   images: ["https://example.com/img1.jpg"],
//   payment_qrs: ["https://example.com/qr1.jpg"],
//   isActive: true,
//   items: [
//     {
//       _id: "1",
//       name: "Paneer Butter Masala",
//       description: "Creamy paneer curry",
//       price: 280,
//       veg_or_nonveg: "veg",
//     },
//     {
//       _id: "2",
//       name: "Dal Tadka",
//       description: "Yellow lentils tempered with garlic",
//       price: 150,
//       veg_or_nonveg: "veg",
//     },
//     {
//       _id: "3",
//       name: "Chicken Curry",
//       description: "Traditional home style chicken curry",
//       price: 320,
//       veg_or_nonveg: "nonveg",
//     },
//   ],
// };

// const TABS = ["Basic Info", "Contact & Address", "Menu Items", "Images & QR"];

// export default function UpdateVendor() {
// const [activeTab, setActiveTab] = useState(0);
// const [form, setForm] = useState(INITIAL_STATE);
// const [saving, setSaving] = useState(false);
// const [saved, setSaved] = useState(false);

//   // new item form
//   const [newItem, setNewItem] = useState({
//     name: "",
//     description: "",
//     price: "",
//     veg_or_nonveg: "veg",
//   });
//   const [editingItem, setEditingItem] = useState(null); // _id of item being edited

// const set = (path, value) => {
//   setForm((prev) => {
//     const keys = path.split(".");
//     const next = { ...prev };
//     let cur = next;
//     for (let i = 0; i < keys.length - 1; i++) {
//       cur[keys[i]] = { ...cur[keys[i]] };
//       cur = cur[keys[i]];
//     }
//     cur[keys[keys.length - 1]] = value;
//     return next;
//   });
// };

//   const handleSave = async () => {
//     setSaving(true);
//     await new Promise((r) => setTimeout(r, 1200));
//     setSaving(false);
//     setSaved(true);
//     setTimeout(() => setSaved(false), 2500);
//   };

// const addItem = () => {
//   if (!newItem.name || !newItem.price) return;
//   setForm((prev) => ({
//     ...prev,
//     items: [
//       ...prev.items,
//       {
//         ...newItem,
//         _id: Date.now().toString(),
//         price: Number(newItem.price),
//       },
//     ],
//   }));
//   setNewItem({ name: "", description: "", price: "", veg_or_nonveg: "veg" });
// };

// const deleteItem = (id) => {
//   setForm((prev) => ({
//     ...prev,
//     items: prev.items.filter((i) => i._id !== id),
//   }));
// };

// const updateItem = (id, field, value) => {
//   setForm((prev) => ({
//     ...prev,
//     items: prev.items.map((i) =>
//       i._id === id ? { ...i, [field]: value } : i,
//     ),
//   }));
// };

import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import { api } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const EMPTY_STATE = {
  name: "",
  contact: { mobile_no: "", email: "" },
  address: {
    plotNo: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
  },
  images: [],
  payment_qrs: [],
  isActive: true,
  items: [],
};

export default function UpdateVendor() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState(EMPTY_STATE);
  const [originalForm, setOriginalForm] = useState(EMPTY_STATE); // for reset
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const TABS = ["Basic Info", "Contact & Address", "Menu Items", "Images & QR"];

  const [saved, setSaved] = useState(false);
  // new item form
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    veg_or_nonveg: "veg",
  });
  const [editingItem, setEditingItem] = useState(null);

  // ── FETCH VENDOR PROFILE ──────────────────────────────
  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/v1/vendors/vendor/profile`);
      const vendor = data.data || {};
      setForm(vendor);
      setOriginalForm(vendor); // save original for reset
    } catch (err) {
      console.log(err);
      toast.error("Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
  }, []);
  const set = (path, value) => {
    setForm((prev) => {
      const keys = path.split(".");
      const next = { ...prev };
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };
  // ── SAVE ─────────────────────────────────────────────
  // const handleSave = async () => {
  //   try {
  //     setSaving(true);
  //     const res = await api.patch(`/api/v1/vendors`, form);
  //     toast.success(res.data.message || "Vendor updated successfully");
  //     setOriginalForm(form); // update reset baseline
  //   } catch (err) {
  //     toast.error(err?.response?.data?.message || "Failed to save changes");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
    try {
      setSaving(true);

      // ── Diff items against originalForm ──────────────────
      const originalIds = new Set(originalForm.items.map((i) => i._id));
      const currentIds = new Set(form.items.map((i) => i._id));
      // NEW items — fake _id stripped
      const addItems = form.items
        .filter((i) => !originalIds.has(i._id))
        .map(({ _id, ...rest }) => rest);

      // DELETED items
      const deleteItems = originalForm.items
        .filter((i) => !currentIds.has(i._id))
        .map((i) => i._id);

      // UPDATED items — exist in both but fields changed
      const updateItems = form.items.filter((item) => {
        if (!originalIds.has(item._id)) return false;
        const orig = originalForm.items.find((o) => o._id === item._id);
        return (
          orig.name !== item.name ||
          orig.description !== item.description ||
          orig.price !== item.price ||
          orig.veg_or_nonveg !== item.veg_or_nonveg
        );
      });

      const payload = {
        // basic fields
        name: form.name,
        contact: form.contact,
        address: form.address,
        images: form.images,
        payment_qrs: form.payment_qrs,
        isActive: form.isActive,
        // item diffs
        addItems,
        deleteItems,
        updateItems,
      };

      console.log("Saving payload:", payload); // debug

      const res = await api.put(`/api/v1/vendors`, payload);
      toast.success(res.data.message || "Vendor updated successfully");

      // refresh from server so IDs are correct for newly added items
      await fetchVendorProfile();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // rest of your handlers stay the same...
  const addItem = () => {
    if (!newItem.name || !newItem.price) return;
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...newItem,
          _id: Date.now().toString(),
          price: Number(newItem.price),
        },
      ],
    }));
    setNewItem({ name: "", description: "", price: "", veg_or_nonveg: "veg" });
  };

  const deleteItem = (id) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i._id !== id),
    }));
  };

  const updateItem = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i._id === id ? { ...i, [field]: value } : i,
      ),
    }));
  };

  // ── LOADING STATE ─────────────────────────────────────
  if (loading) {
    return (
      <AppLayout>
        <div className="page-loader" style={{ height: "60vh" }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Loading vendor profile...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* PAGE HEADER */}
        <div
          className="page-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <h2
              style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              🏪 Update Vendor
            </h2>
            <p
              style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}
            >
              Manage your restaurant profile, menu & settings
            </p>
          </div>
          {/* Active toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Store Active
            </span>
            <div
              onClick={() => set("isActive", !form.isActive)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 99,
                background: form.isActive ? "var(--green)" : "var(--bg-active)",
                border: "1px solid var(--border-base)",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.25s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: form.isActive ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              />
            </div>
            <span
              className={`badge ${form.isActive ? "badge-active" : "badge-cancelled"}`}
            >
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div
          className="toolbar"
          style={{
            marginBottom: 0,
            borderBottom: "1px solid var(--border-dim)",
            paddingBottom: 0,
          }}
        >
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`filter-tab${activeTab === i ? " active" : ""}`}
              onClick={() => setActiveTab(i)}
              style={{
                borderBottom:
                  activeTab === i
                    ? "2px solid var(--ember)"
                    : "2px solid transparent",
                borderRadius: 0,
                paddingBottom: 10,
              }}
            >
              {["🏷️", "📍", "🍽️", "🖼️"][i]} {tab}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          {/* ── TAB 0: Basic Info ── */}
          {activeTab === 0 && (
            <div className="panel animate-fadeup">
              <div className="panel-header">
                <div className="panel-title">🏷️ Basic Information</div>
              </div>
              <div className="panel-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label className="field-label" style={labelStyle}>
                      Restaurant Name
                    </label>
                    <input
                      className="field-input"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Spice Garden"
                    />
                  </div>
                  <div>
                    <label className="field-label" style={labelStyle}>
                      Status
                    </label>
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                      {["active", "inactive"].map((s) => (
                        <button
                          key={s}
                          onClick={() => set("isActive", s === "active")}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "var(--radius-md)",
                            border: `1.5px solid ${(s === "active") === form.isActive ? "var(--ember)" : "var(--border-dim)"}`,
                            background:
                              (s === "active") === form.isActive
                                ? "var(--ember-glow)"
                                : "var(--bg-elevated)",
                            color:
                              (s === "active") === form.isActive
                                ? "var(--ember-bright)"
                                : "var(--text-secondary)",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                            textTransform: "capitalize",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {s === "active" ? "✅ Active" : "🔴 Inactive"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 1: Contact & Address ── */}
          {activeTab === 1 && (
            <div
              className="animate-fadeup"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">📞 Contact Details</div>
                </div>
                <div className="panel-body">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label className="field-label" style={labelStyle}>
                        Mobile Number
                      </label>
                      <input
                        className="field-input"
                        value={form.contact.mobile_no}
                        onChange={(e) =>
                          set("contact.mobile_no", e.target.value)
                        }
                        placeholder="10-digit mobile"
                      />
                    </div>
                    <div>
                      <label className="field-label" style={labelStyle}>
                        Email Address
                      </label>
                      <input
                        className="field-input"
                        value={form.contact.email}
                        onChange={(e) => set("contact.email", e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">📍 Address</div>
                </div>
                <div className="panel-body">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    {[
                      ["Plot No", "address.plotNo", "e.g. 12A"],
                      ["Street", "address.street", "e.g. MG Road"],
                      ["Area", "address.area", "e.g. Koregaon Park"],
                      ["City", "address.city", "e.g. Pune"],
                      ["State", "address.state", "e.g. Maharashtra"],
                      ["Pincode", "address.pincode", "e.g. 411001"],
                    ].map(([label, path, placeholder]) => (
                      <div key={path}>
                        <label className="field-label" style={labelStyle}>
                          {label}
                        </label>
                        <input
                          className="field-input"
                          value={
                            path.split(".").reduce((o, k) => o?.[k], form) || ""
                          }
                          onChange={(e) => set(path, e.target.value)}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: Menu Items ── */}
          {activeTab === 2 && (
            <div
              className="animate-fadeup"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Add new item */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">➕ Add New Item</div>
                </div>
                <div className="panel-body">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 120px 120px auto",
                      gap: 12,
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label className="field-label" style={labelStyle}>
                        Name
                      </label>
                      <input
                        className="field-input"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Item name"
                      />
                    </div>
                    <div>
                      <label className="field-label" style={labelStyle}>
                        Description
                      </label>
                      <input
                        className="field-input"
                        value={newItem.description}
                        onChange={(e) =>
                          setNewItem((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Short description"
                      />
                    </div>
                    <div>
                      <label className="field-label" style={labelStyle}>
                        Price (₹)
                      </label>
                      <input
                        className="field-input"
                        type="number"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem((p) => ({ ...p, price: e.target.value }))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="field-label" style={labelStyle}>
                        Type
                      </label>
                      <select
                        className="field-input"
                        value={newItem.veg_or_nonveg}
                        onChange={(e) =>
                          setNewItem((p) => ({
                            ...p,
                            veg_or_nonveg: e.target.value,
                          }))
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <option value="veg">🟢 Veg</option>
                        <option value="nonveg">🔴 Non-Veg</option>
                      </select>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={addItem}
                      style={{
                        width: "auto",
                        padding: "10px 18px",
                        marginTop: 20,
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing items */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    🍽️ Menu Items ({form.items.length})
                  </div>
                </div>
                <div className="panel-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item) => (
                        <tr key={item._id}>
                          <td>
                            {editingItem === item._id ? (
                              <input
                                className="field-input"
                                value={item.name}
                                style={{ padding: "6px 10px", fontSize: 12 }}
                                onChange={(e) =>
                                  updateItem(item._id, "name", e.target.value)
                                }
                              />
                            ) : (
                              <span className="td-primary">{item.name}</span>
                            )}
                          </td>
                          <td>
                            {editingItem === item._id ? (
                              <input
                                className="field-input"
                                value={item.description}
                                style={{ padding: "6px 10px", fontSize: 12 }}
                                onChange={(e) =>
                                  updateItem(
                                    item._id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                              />
                            ) : (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                }}
                              >
                                {item.description}
                              </span>
                            )}
                          </td>
                          <td>
                            {editingItem === item._id ? (
                              <input
                                className="field-input"
                                type="number"
                                value={item.price}
                                style={{
                                  padding: "6px 10px",
                                  fontSize: 12,
                                  width: 90,
                                }}
                                onChange={(e) =>
                                  updateItem(
                                    item._id,
                                    "price",
                                    Number(e.target.value),
                                  )
                                }
                              />
                            ) : (
                              <span className="td-mono">₹{item.price}</span>
                            )}
                          </td>
                          <td>
                            {editingItem === item._id ? (
                              <select
                                className="field-input"
                                value={item.veg_or_nonveg}
                                style={{ padding: "6px 10px", fontSize: 12 }}
                                onChange={(e) =>
                                  updateItem(
                                    item._id,
                                    "veg_or_nonveg",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="veg">🟢 Veg</option>
                                <option value="nonveg">🔴 Non-Veg</option>
                              </select>
                            ) : (
                              <span
                                className={`badge ${item.veg_or_nonveg === "veg" ? "badge-delivered" : "badge-cancelled"}`}
                              >
                                {item.veg_or_nonveg === "veg"
                                  ? "🟢 Veg"
                                  : "🔴 Non-Veg"}
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              {editingItem === item._id ? (
                                <button
                                  className="btn-ghost"
                                  onClick={() => setEditingItem(null)}
                                  style={{
                                    fontSize: 12,
                                    padding: "5px 10px",
                                    borderColor: "var(--green)",
                                    color: "var(--green)",
                                  }}
                                >
                                  ✓ Done
                                </button>
                              ) : (
                                <button
                                  className="btn-ghost"
                                  onClick={() => setEditingItem(item._id)}
                                  style={{ fontSize: 12, padding: "5px 10px" }}
                                >
                                  ✏️ Edit
                                </button>
                              )}
                              <button
                                className="btn-ghost"
                                onClick={() => deleteItem(item._id)}
                                style={{
                                  fontSize: 12,
                                  padding: "5px 10px",
                                  borderColor: "var(--red)",
                                  color: "var(--red)",
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: Images & QR ── */}
          {activeTab === 3 && (
            <div
              className="animate-fadeup"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {[
                {
                  label: "🖼️ Restaurant Images",
                  key: "images",
                  hint: "Cover photos shown to customers",
                },
                {
                  label: "📲 Payment QR Codes",
                  key: "payment_qrs",
                  hint: "UPI / QR codes for payment",
                },
              ].map(({ label, key, hint }) => (
                <div className="panel" key={key}>
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">{label}</div>
                      <div className="panel-subtitle">{hint}</div>
                    </div>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 12 }}
                      onClick={() =>
                        setForm((p) => ({ ...p, [key]: [...p[key], ""] }))
                      }
                    >
                      ➕ Add URL
                    </button>
                  </div>
                  <div
                    className="panel-body"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {form[key].map((url, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <input
                          className="field-input"
                          value={url}
                          placeholder="https://..."
                          onChange={(e) => {
                            const arr = [...form[key]];
                            arr[idx] = e.target.value;
                            setForm((p) => ({ ...p, [key]: arr }));
                          }}
                        />
                        {url && (
                          <img
                            src={url}
                            alt=""
                            onError={(e) => (e.target.style.display = "none")}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 8,
                              objectFit: "cover",
                              border: "1px solid var(--border-dim)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <button
                          className="btn-icon"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              [key]: p[key].filter((_, i) => i !== idx),
                            }))
                          }
                          style={{
                            color: "var(--red)",
                            borderColor: "var(--red-dim)",
                            flexShrink: 0,
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    {form[key].length === 0 && (
                      <div className="empty-state" style={{ padding: 24 }}>
                        <div className="empty-icon">🖼️</div>
                        <p>No URLs added yet. Click "Add URL" to begin.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SAVE BAR */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            marginTop: 28,
            background: "var(--bg-base)",
            borderTop: "1px solid var(--border-dim)",
            padding: "16px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {saved
              ? "✅ Changes saved successfully!"
              : "All changes are saved locally — click Save to push to server."}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={() => setForm(originalForm)}>
              ↩ Reset
            </button>
            <button
              className="btn-primary"
              style={{ width: "auto", padding: "10px 28px" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner"
                    style={{ width: 14, height: 14, borderWidth: 2 }}
                  />{" "}
                  Saving…
                </>
              ) : saved ? (
                "✅ Saved!"
              ) : (
                "💾 Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  marginBottom: 6,
};
