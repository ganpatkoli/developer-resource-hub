import { Navigate, useLocation } from "react-router-dom";
import { getAdminToken } from "../api/client";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}
