import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const responsiveStyles = `
  .signup-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 520px;
    background: var(--bg-void);
  }

  /* Tablet — hide visual panel, show only form */
  @media (max-width: 900px) {
    .signup-page {
      grid-template-columns: 1fr;
    }
    .signup-visual {
      display: none;
    }
    .signup-panel {
      border-left: none;
      padding: 32px 24px;
    }
    .signup-form-wrap {
      max-width: 440px !important;
    }
  }

  /* Mobile — tighter padding, full-width form */
  @media (max-width: 480px) {
    .signup-panel {
      padding: 24px 16px;
      align-items: flex-start;
    }
    .signup-form-wrap {
      max-width: 100% !important;
      width: 100%;
    }
    .signup-mobile-header {
      display: flex !important;
    }
    .role-selector {
      gap: 6px;
    }
    .role-btn {
      padding: 10px 4px;
      font-size: 10px;
    }
    .role-btn .role-icon {
      font-size: 16px;
    }
    .field-input {
      font-size: 16px !important; /* prevents iOS zoom on focus */
    }
  }

  /* Show mobile logo header only on small screens */
  .signup-mobile-header {
    display: none;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
  }
`;

const ROLES = [
  //   { id: "user", icon: "🍱", label: "User" },
  //   { id: "vendor_admin", icon: "🏪", label: "Vendor" },
  //   { id: "master_admin", icon: "👑", label: "Admin" },
];

export default function SignUp() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("user");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup, fillCredentials } = useAuth();
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid 10-digit number";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Minimum 6 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const user = await signup({
        username: form.name,
        email: form.email,
        mobile_no: form.phone,
        password: form.password,
      });
      if (user) {
        navigate("/user/dashboard");
        alert(`Welcome aboard, ${user.name.split(" ")[0]}! 🎉`);
      }
    } catch (err) {
      setErrors({ general: err.message || "Signup failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{responsiveStyles}</style>
      <div className="signup-page">
        {/* ── LEFT VISUAL ── */}
        <div className="login-visual signup-visual">
          <div className="login-visual-grid" />

          <div className="login-brand">
            <div className="login-logo">
              <div className="logo-mark">🍱</div>
              <div className="logo-text">
                Meal<span>Box</span>
              </div>
            </div>

            <h1 className="login-headline">
              Join the
              <br />
              smarter <em>lunch</em>
              <br />
              network.
            </h1>
            <p className="login-sub">
              Create your account in seconds. Manage orders, track deliveries,
              and stay on top of your society's meal operations — all in one
              place.
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

        {/* ── RIGHT PANEL ── */}
        <div className="login-panel signup-panel">
          <div
            className="login-form-wrap signup-form-wrap"
            style={{ maxWidth: 400 }}
          >
            {/* Mobile-only logo */}
            <div className="signup-mobile-header">
              <div className="logo-mark" style={{ fontSize: 22 }}>
                🍱
              </div>
              <div
                className="logo-text"
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                Meal<span style={{ color: "var(--ember)" }}>Box</span>
              </div>
            </div>

            <h2 className="login-form-title">Create account</h2>
            {/* <p className="login-form-sub">
              Pick your role and fill in your details
            </p> */}

            {/* Role selector */}
            <div className="role-selector">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  className={`role-btn ${selectedRole === r.id ? "active" : ""}`}
                  onClick={() => setSelectedRole(r.id)}
                  type="button"
                >
                  <span className="role-icon">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>

            {errors.general && (
              <div
                style={{
                  background: "var(--red-dim)",
                  border: "1px solid var(--red)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 12.5,
                  color: "var(--red)",
                  fontWeight: 600,
                }}
              >
                ⚠ {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="field">
                <label className="field-label">Full name</label>
                <input
                  className="field-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Riya Sharma"
                  autoComplete="name"
                  style={errors.name ? { borderColor: "var(--red)" } : {}}
                />
                {errors.name && <FieldError msg={errors.name} />}
              </div>

              {/* Email */}
              <div className="field">
                <label className="field-label">Email address</label>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={errors.email ? { borderColor: "var(--red)" } : {}}
                />
                {errors.email && <FieldError msg={errors.email} />}
              </div>

              {/* Phone */}
              <div className="field">
                <label className="field-label">Phone number</label>
                <input
                  className="field-input"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="98765 43210"
                  autoComplete="tel"
                  maxLength={10}
                  style={errors.phone ? { borderColor: "var(--red)" } : {}}
                />
                {errors.phone && <FieldError msg={errors.phone} />}
              </div>

              {/* Password */}
              <div className="field">
                <label className="field-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="field-input"
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    style={{
                      paddingRight: 44,
                      ...(errors.password ? { borderColor: "var(--red)" } : {}),
                    }}
                  />
                  <EyeBtn
                    show={showPass}
                    toggle={() => setShowPass((v) => !v)}
                  />
                </div>
                {errors.password && <FieldError msg={errors.password} />}
              </div>

              {/* Confirm Password */}
              <div className="field">
                <label className="field-label">Confirm password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="field-input"
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    style={{
                      paddingRight: 44,
                      ...(errors.confirmPassword
                        ? { borderColor: "var(--red)" }
                        : form.confirmPassword &&
                            form.password === form.confirmPassword
                          ? { borderColor: "var(--green)" }
                          : {}),
                    }}
                  />
                  <EyeBtn
                    show={showConfirm}
                    toggle={() => setShowConfirm((v) => !v)}
                  />
                </div>
                {errors.confirmPassword && (
                  <FieldError msg={errors.confirmPassword} />
                )}
                {!errors.confirmPassword &&
                  form.confirmPassword &&
                  form.password === form.confirmPassword && (
                    <FieldSuccess msg="Passwords match ✓" />
                  )}
              </div>

              {/* Password strength hint */}
              {form.password && <PasswordStrength password={form.password} />}

              <button
                className="btn-primary"
                type="submit"
                disabled={loading}
                style={{ marginTop: 4 }}
              >
                {loading ? <span className="spinner" /> : null}
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>

            <div
              style={{
                marginTop: 24,
                padding: "16px 0",
                borderTop: "1px solid var(--border-subtle)",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--ember)",
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    padding: 0,
                  }}
                >
                  Sign in →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Small reusable helpers ── */

function FieldError({ msg }) {
  return (
    <p
      style={{
        fontSize: 11.5,
        color: "var(--red)",
        marginTop: 5,
        fontWeight: 600,
      }}
    >
      {msg}
    </p>
  );
}

function FieldSuccess({ msg }) {
  return (
    <p
      style={{
        fontSize: 11.5,
        color: "var(--green)",
        marginTop: 5,
        fontWeight: 600,
      }}
    >
      {msg}
    </p>
  );
}

function EyeBtn({ show, toggle }) {
  return (
    <button
      type="button"
      onClick={toggle}
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
        padding: 0,
      }}
    >
      {show ? "🙈" : "👁️"}
    </button>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label: "6+ chars", pass: password.length >= 6 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Symbol", pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.pass).length;
  const colors = [
    "var(--red)",
    "var(--red)",
    "var(--ember)",
    "var(--green)",
    "var(--green)",
  ];
  const labels = ["", "Weak", "Weak", "Fair", "Strong"];

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 4,
              background: i < strength ? colors[strength] : "var(--bg-active)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      {/* Checks */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {checks.map((c) => (
          <span
            key={c.label}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: c.pass ? "var(--green)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 3,
              transition: "color 0.2s",
            }}
          >
            {c.pass ? "✓" : "○"} {c.label}
          </span>
        ))}
        {strength > 0 && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 700,
              color: colors[strength],
            }}
          >
            {labels[strength]}
          </span>
        )}
      </div>
    </div>
  );
}
