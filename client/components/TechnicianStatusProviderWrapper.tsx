import React from "react";
import { TechnicianStatusProvider } from "@/context/TechnicianStatusContext";
import { useAuth } from "@/context/AuthContext";

interface TechnicianStatusProviderWrapperProps {
  children: React.ReactNode;
}

export const TechnicianStatusProviderWrapper: React.FC<
  TechnicianStatusProviderWrapperProps
> = ({ children }) => {
  const { user } = useAuth();

  return (
    <TechnicianStatusProvider currentUser={user}>
      {children}
    </TechnicianStatusProvider>
  );
};
