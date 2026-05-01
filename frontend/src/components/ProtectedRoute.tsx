import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/AuthContext.tsx";
import { ReactElement } from "react";

export default function ProtectedRoute(): ReactElement {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
