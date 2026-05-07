import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "./Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isAdminSession, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullPage message="Checking session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    // Must be an admin role AND have authenticated via /admin/login in this tab
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    if (!isAdminSession) {
      // Valid admin user but no tab-scoped admin session — send to admin login
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
}
