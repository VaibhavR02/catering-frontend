import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ROLES = [
  { id: "user", icon: "🍱", label: "User" },
  { id: "vendor_admin", icon: "🏪", label: "Vendor" },
  { id: "master_admin", icon: "👑", label: "Master Admin" },
];

const ROLE_ROUTES = {
  user: "/user/dashboard",
  vendor_admin: "/vendor/dashboard",
  master_admin: "/admin/dashboard",
};

export default function Login() {
  const { login, fillCredentials } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("user");
  const [email, setEmail] = useState("user@lunch.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const pickRole = (role) => {
    setSelectedRole(role);
    const creds = fillCredentials(role);
    setEmail(creds.email);
    setPassword(creds.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.name.split(" ")[0]}! 🎉`);
      navigate(ROLE_ROUTES[user.user_type]);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT VISUAL */}
      <div className="login-visual">
        <div className="login-visual-grid" />

        <div className="login-brand">
          <div className="login-logo">
            <div className="logo-mark">🍱</div>
            <div className="logo-text">
              Lunch<span>Box</span>
            </div>
          </div>

          <h1 className="login-headline">
            Society-wise
            <br />
            lunch, <em>managed</em>
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
            { value: "12K+", label: "Daily Tiffins" },
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

      {/* RIGHT PANEL */}
      <div className="login-panel">
        <div className="login-form-wrap">
          <h2 className="login-form-title">Sign in</h2>
          <p className="login-form-sub">
            Choose your role and enter your credentials
          </p>

          {/* Role selector */}
          <div className="role-selector">
            {ROLES.map((r) => (
              <button
                key={r.id}
                className={`role-btn ${selectedRole === r.id ? "active" : ""}`}
                onClick={() => pickRole(r.id)}
                type="button"
              >
                <span className="role-icon">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Email address</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="field-input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Demo credentials hint */}
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 12px",
                marginBottom: 20,
                fontSize: 11.5,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                lineHeight: 1.7,
              }}
            >
              <span style={{ color: "var(--ember)", fontWeight: 700 }}>
                DEMO
              </span>
              {"  "}pw:{" "}
              <span style={{ color: "var(--text-secondary)" }}>123456</span>
              {"  "}•{"  "}
              {selectedRole === "user" && "user@lunch.com"}
              {selectedRole === "vendor_admin" && "vendor@lunch.com"}
              {selectedRole === "master_admin" && "admin@lunch.com"}
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? "Authenticating..." : "Continue →"}
            </button>
          </form>

          <div
            style={{
              marginTop: 28,
              padding: "16px 0",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <p
              style={{
                fontSize: 11.5,
                color: "var(--text-muted)",
                textAlign: "center",
              }}
            >
              Session stored in secure cookies • 7-day expiry
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
