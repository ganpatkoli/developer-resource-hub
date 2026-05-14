import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUserToken } from "../api/client";

export default function UserProtectedRoute({ children }) {
  const location = useLocation();
  if (!getUserToken()) {
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }
  return children;
}
