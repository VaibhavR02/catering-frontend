// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

// user_type → dashboard route
const ROLE_ROUTES = {
  user: "/user/dashboard",
  vendor_admin: "/vendor/dashboard",
  master_admin: "/admin/dashboard",
};

const ROLES = [
  // { id: "user", icon: "🍱", label: "User" },
  // { id: "vendor_admin", icon: "🏪", label: "Vendor" },
  // { id: "master_admin", icon: "👑", label: "Admin" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const pickRole = (role) => {
    setSelectedRole(role);
    setError("");

    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      // result = { ...userProfile, message: 'Welcome Sneha A, ...' }
      toast.success(result.message);
      const route = ROLE_ROUTES[result.user_type] ?? "/user/dashboard";
      navigate(route);
    } catch (err) {
      const msg = err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── LEFT VISUAL ── */}
      <div className="login-visual">
        <div className="login-visual-grid" />

        <div className="login-brand">
          <div className="login-logo">
            <div className="logo-mark">
              <img id="logo" src="/favicon-meal.png" alt="Logo" />
            </div>
            <div className="logo-text">
              Meal<span>Box</span>
            </div>
          </div>

          <h1 className="login-headline">
            Society-wise
            <br />
            Orders, <em>managed</em>
            <br />
            brilliantly.
          </h1>

          <p className="login-sub">
            Real-time order tracking, vendor dashboards, and payment analytics —
            all in one platform built for modern lunch operations.
          </p>
        </div>

        <div className="login-stats">
          {[
            { value: "12K+", label: "Daily Orders" },
            { value: "98%", label: "On-time Rate" },
            { value: "₹2.4L", label: "Monthly GMV" },
          ].map((s) => (
            <div className="login-stat" key={s.label}>
              <div className="login-stat-value">{s.value}</div>
              <div className="login-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="login-panel">
        <div className="login-form-wrap">
          <h2 className="login-form-title">Sign in</h2>
          {/* <p className="login-form-sub">
            Choose your role and enter your credentials
          </p> */}

          {/* Role selector */}
          <div className="role-selector">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`role-btn ${selectedRole === r.id ? "active" : ""}`}
                onClick={() => pickRole(r.id)}
              >
                <span className="role-icon">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Email address</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="field-input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error box */}
            {error && (
              <div
                style={{
                  background: "var(--red-dim)",
                  border: "1px solid var(--red)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  marginBottom: 16,
                  fontSize: 12.5,
                  color: "var(--red)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Authenticating…
                </>
              ) : (
                "Continue →"
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: 28,
              paddingTop: 16,
              borderTop: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
              New to MealBox?{" "}
              <Link
                to="/signup"
                style={{ color: "var(--ember)", fontWeight: 500 }}
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
