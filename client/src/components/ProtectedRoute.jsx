import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "./ui";

export default function ProtectedRoute({ roles, children }) {
  const { user, status } = useAuthStore();

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}
