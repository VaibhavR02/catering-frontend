import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Role → default home route
const ROLE_HOME = {
  user: "/user/dashboard",
  vendor_admin: "/vendor/dashboard",
  master_admin: "/admin/dashboard",
};

// ── LOADING SCREEN ─────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background: "var(--bg-void)",
      }}
    >
      <div style={{ fontSize: 52 }}>🍱</div>
      <div
        style={{
          width: 24,
          height: 24,
          border: "2.5px solid var(--border-dim)",
          borderTopColor: "var(--ember)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <p
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
        }}
      >
        Loading LunchBox…
      </p>
    </div>
  );
}

// ── PROTECTED ROUTE ────────────────────────────────────────
// Requires user to be logged in
// If `role` prop passed, also checks that user.user_type matches
export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role → redirect to their own home
  if (role && user.user_type !== role) {
    return <Navigate to={ROLE_HOME[user.user_type] ?? "/login"} replace />;
  }

  return children;
}

// ── PUBLIC ROUTE ───────────────────────────────────────────
// Only for guests (login page)
// If already logged in → redirect to role home
export function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (user) {
    return <Navigate to={ROLE_HOME[user.user_type] ?? "/login"} replace />;
  }

  return children;
}
