import "./global.css";

import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./components/AppRouter";
import { VisitTrackingProvider } from "./context/VisitTrackingContext";
import { CustomerStoreProvider } from "./context/CustomerStoreContext";
import { AuthProvider } from "./context/AuthContext";
import { TechnicianStatusProviderWrapper } from "./components/TechnicianStatusProviderWrapper";
import { FeedbackProvider } from "@/components/ui/status-popup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FeedbackProvider>
        <AuthProvider>
          <TechnicianStatusProviderWrapper>
            <CustomerStoreProvider>
              <VisitTrackingProvider>
                <BrowserRouter>
                  <AppRouter />
                </BrowserRouter>
              </VisitTrackingProvider>
            </CustomerStoreProvider>
          </TechnicianStatusProviderWrapper>
        </AuthProvider>
      </FeedbackProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
