
import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../contexts/AuthContext"

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
    )
}

export default function UserProfile() {
    const { user } = useAuth()

    const [modal, setModal] = useState(null)

    const [form, setForm] = useState({
        username: user?.username || "",
        mobile_no: user?.mobile_no || "",
        email: user?.email || "",
        company_name: user?.company?.name || "",
        society: user?.company?.address?.society || "",
        tower: user?.company?.address?.tower || "",
        floor: user?.company?.address?.floor || "",
        id_type: user?.id_proof?.id_type || "",
        image: user?.id_proof?.image || ""
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const updateProfile = async () => {
        try {
            await api.put("/api/v1/users/update-profile", form)
            window.location.reload()
        } catch (err) {
            console.error(err)
        }
    }

    if (!user) {
        return (
            <AppLayout>
                <div style={{ padding: 40 }}>Loading profile...</div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>

            {/* PROFILE HEADER */}

            <div className="profile-card">
                <div className="profile-avatar">
                    {user.username?.charAt(0)?.toUpperCase()}
                </div>

                <div className="profile-info">
                    <h2>{user.username}</h2>
                    <p>{user.email}</p>
                    <span className={`badge badge-${user.user_type}`}>
                        {user.user_type}
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
                        <p>{user.mobile_no || "Not provided"}</p>
                    </div>

                    <div>
                        <label>Email</label>
                        <p>{user.email}</p>
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
                        <p>{user.company?.name || "—"}</p>
                    </div>

                    <div>
                        <label>Society</label>
                        <p>{user.company?.address?.society || "—"}</p>
                    </div>

                    <div>
                        <label>Tower</label>
                        <p>{user.company?.address?.tower || "—"}</p>
                    </div>

                    <div>
                        <label>Floor</label>
                        <p>{user.company?.address?.floor || "—"}</p>
                    </div>
                </div>
            </div>



            <div className="panel">
                <div className="panel-header">
                    <div className="panel-title">Verification</div>
                </div>
                <div className="profile-grid">
                    <div> <label>Status</label>
                        <span className={`badge ${user.verification_status?.is_verified ? "badge-success" : "badge-pending"}`} > {user.verification_status?.is_verified ? "Verified" : "Pending"} </span> </div> <div> <label>Remark</label> <p>{user.verification_status?.Remark || "—"}</p> </div> </div> </div>


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
                        <p>{user.id_proof?.id_type || "—"}</p>
                    </div>

                    {user.id_proof?.image && (
                        <img
                            src={user.id_proof.image}
                            alt="ID"
                            style={{ width: 120, borderRadius: 6 }}
                        />
                    )}
                </div>
            </div>


            {/* ───── MODALS ───── */}

            {modal === "profile" && (
                <Modal title="Edit Profile" onClose={() => setModal(null)}>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Name"
                    />

                    <button onClick={updateProfile}>Save</button>
                </Modal>
            )}

            {modal === "contact" && (
                <Modal title="Edit Contact" onClose={() => setModal(null)}>
                    <input
                        name="mobile_no"
                        value={form.mobile_no}
                        onChange={handleChange}
                        placeholder="Mobile"
                    />

                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                    />

                    <button onClick={updateProfile}>Save</button>
                </Modal>
            )}

            {modal === "company" && (
                <Modal title="Edit Company" onClose={() => setModal(null)}>
                    <input
                        name="company_name"
                        value={form.company_name}
                        onChange={handleChange}
                        placeholder="Company"
                    />

                    <input
                        name="society"
                        value={form.society}
                        onChange={handleChange}
                        placeholder="Society"
                    />

                    <input
                        name="tower"
                        value={form.tower}
                        onChange={handleChange}
                        placeholder="Tower"
                    />

                    <input
                        name="floor"
                        value={form.floor}
                        onChange={handleChange}
                        placeholder="Floor"
                    />

                    <button onClick={updateProfile}>Save</button>
                </Modal>
            )}

            {modal === "idproof" && (
                <Modal title="Edit ID Proof" onClose={() => setModal(null)}>
                    <input
                        name="id_type"
                        value={form.id_type}
                        onChange={handleChange}
                        placeholder="ID Type"
                    />

                    <input
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        placeholder="Image URL"
                    />

                    <button onClick={updateProfile}>Save</button>
                </Modal>
            )}

        </AppLayout>
    )
}