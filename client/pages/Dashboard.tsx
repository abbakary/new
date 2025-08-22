import React from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@shared/types";
import AdminDashboard from "./dashboards/AdminDashboard";
import OfficeManagerDashboard from "./dashboards/OfficeManagerDashboard";
import EnhancedOfficeManagerDashboard from "./dashboards/EnhancedOfficeManagerDashboard";
import TechnicianDashboard from "./dashboards/TechnicianDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.OFFICE_MANAGER:
      return <EnhancedOfficeManagerDashboard />;
    case UserRole.TECHNICIAN:
      return <TechnicianDashboard />;
    default:
      return <AdminDashboard />;
  }
}
