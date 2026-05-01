import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import LoginPage from "./pages/LoginPage";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import UserDashboard from "./pages/UserDashboard";
import MyOrders from "./pages/MyOrders";
import VendorDashboard from "./pages/VendorDashboard";
import MasterDashboard from "./screens/MasterDashboard";
import UserProfile from "./pages/UserProfile";
import NewOrder from "./pages/NewOrder";
import SocietywiseVendorOrders from "./pages/SocietywiseVendorOrders";
import UpdateVendor from "./pages/UpdateVendor";
import SignUp from "./screens/SignUp";

const Placeholder = ({ title }) => (
  <AppLayout>
    <div className="panel" style={{ maxWidth: 480 }}>
      <div className="panel-header">
        <div className="panel-title">{title}</div>
      </div>
      <div className="empty-state">
        <div className="empty-icon">🚧</div>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Coming soon</p>
      </div>
    </div>
  </AppLayout>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />

            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute role="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/order"
              element={
                <ProtectedRoute role="user">
                  <NewOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/my-orders"
              element={
                <ProtectedRoute role="user">
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute role="user">
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute role="vendor_admin">
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/orders"
              element={
                <ProtectedRoute role="vendor_admin">
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/orders/:societyId"
              element={
                <ProtectedRoute role="vendor_admin">
                  <SocietywiseVendorOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/payments"
              element={
                <ProtectedRoute role="vendor_admin">
                  <Placeholder title="₹ Payments" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/update"
              element={
                <ProtectedRoute role="vendor_admin">
                  <UpdateVendor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/reports"
              element={
                <ProtectedRoute role="vendor_admin">
                  <Placeholder title="📊 Reports" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="master_admin">
                  <MasterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute role="master_admin">
                  <MasterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vendors"
              element={
                <ProtectedRoute role="master_admin">
                  <Placeholder title="🏪 Vendors" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/societies"
              element={
                <ProtectedRoute role="master_admin">
                  <Placeholder title="🏢 Societies" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute role="master_admin">
                  <Placeholder title="📊 Analytics" />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
