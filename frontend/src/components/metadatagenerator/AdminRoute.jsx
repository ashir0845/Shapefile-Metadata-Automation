import { Navigate, Outlet } from "react-router-dom";

// Only users whose stored role is Admin can open admin pages.
// The backend enforces this too; this check only hides the page.
export default function AdminRoute() {
  const role = sessionStorage.getItem("role");

  if (role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}