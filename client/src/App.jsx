import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { authApi } from "./api/auth";
import { useAuthStore } from "./store/authStore";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Guards from "./pages/admin/Guards";
import GuardDetail from "./pages/admin/GuardDetail";
import Clients from "./pages/admin/Clients";
import ClientDetail from "./pages/admin/ClientDetail";
import Sites from "./pages/admin/Sites";
import Payments from "./pages/admin/Payments";
import Complaints from "./pages/admin/Complaints";

import GuardDashboard from "./pages/guard/GuardDashboard";
import GuardShifts from "./pages/guard/GuardShifts";
import GuardPayments from "./pages/guard/GuardPayments";

import ClientDashboard from "./pages/client/ClientDashboard";
import ClientComplaints from "./pages/client/ClientComplaints";
import ClientSubscription from "./pages/client/ClientSubscription";

export default function App() {
  const { user, status, setSession, clearSession, setStatus } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    authApi
      .me()
      .then(({ user }) => {
        if (!cancelled) setSession(user);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "idle" || status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} replace /> : <Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="guards" element={<Guards />} />
        <Route path="guards/:id" element={<GuardDetail />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="sites" element={<Sites />} />
        <Route path="payments" element={<Payments />} />
        <Route path="complaints" element={<Complaints />} />
      </Route>

      <Route
        path="/guard"
        element={
          <ProtectedRoute roles={["guard"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GuardDashboard />} />
        <Route path="shifts" element={<GuardShifts />} />
        <Route path="payments" element={<GuardPayments />} />
      </Route>

      <Route
        path="/client"
        element={
          <ProtectedRoute roles={["client"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="complaints" element={<ClientComplaints />} />
        <Route path="subscription" element={<ClientSubscription />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to={user ? `/${user.role}` : "/login"} replace />}
      />
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : "/login"} replace />} />
    </Routes>
  );
}
