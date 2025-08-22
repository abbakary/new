import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";

type PopupType = "success" | "error";

interface FeedbackContextValue {
  success: (title: string, description?: string, timeoutMs?: number) => void;
  error: (title: string, description?: string, timeoutMs?: number) => void;
  hide: () => void;
}

interface PopupState {
  open: boolean;
  type: PopupType;
  title: string;
  description?: string;
  timeoutMs?: number;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export const useFeedback = (): FeedbackContextValue => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [popup, setPopup] = useState<PopupState>({ open: false, type: "success", title: "", description: "", timeoutMs: 2500 });

  const hide = useCallback(() => setPopup((p) => ({ ...p, open: false })), []);

  const success = useCallback((title: string, description?: string, timeoutMs: number = 2500) => {
    setPopup({ open: true, type: "success", title, description, timeoutMs });
  }, []);

  const error = useCallback((title: string, description?: string, timeoutMs: number = 3000) => {
    setPopup({ open: true, type: "error", title, description, timeoutMs });
  }, []);

  useEffect(() => {
    if (!popup.open) return;
    if (!popup.timeoutMs || popup.timeoutMs <= 0) return;
    const t = setTimeout(() => setPopup((p) => ({ ...p, open: false })), popup.timeoutMs);
    return () => clearTimeout(t);
  }, [popup.open, popup.timeoutMs]);

  const value = useMemo<FeedbackContextValue>(() => ({ success, error, hide }), [success, error, hide]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Dialog open={popup.open} onOpenChange={(o) => setPopup((p) => ({ ...p, open: o }))}>
        <DialogContent
          className="max-w-lg border-2 border-yellow-400 bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-100 text-yellow-950 shadow-2xl rounded-3xl p-0 backdrop-blur-sm animate-float-gentle overflow-hidden relative"
          aria-describedby={undefined}
        >
          {/* Wave Background Animation */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-400/20 rounded-full animate-wave-1"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/15 rounded-full animate-wave-2"></div>
            <div className="absolute -bottom-15 -left-15 w-36 h-36 bg-yellow-300/25 rounded-full animate-wave-3"></div>
            <div className="absolute top-1/2 right-4 w-6 h-6 bg-yellow-600/30 rounded-full animate-float-particle"></div>
            <div className="absolute top-1/4 left-8 w-4 h-4 bg-yellow-400/40 rounded-full animate-float-particle-delayed"></div>
            <div className="absolute bottom-1/3 right-12 w-3 h-3 bg-yellow-500/35 rounded-full animate-float-particle-slow"></div>
          </div>

          <div className="flex flex-col items-center text-center p-8 relative z-10">
            {popup.type === "success" ? (
              <div className="mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full p-4 shadow-lg animate-icon-bounce relative">
                <div className="absolute inset-0 bg-green-300/30 rounded-full animate-pulse-ring"></div>
                <CheckCircle className="h-20 w-20 text-green-600 stroke-[1.5] relative z-10" />
              </div>
            ) : (
              <div className="mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full p-4 shadow-lg animate-icon-shake relative">
                <div className="absolute inset-0 bg-red-300/30 rounded-full animate-pulse-ring"></div>
                <XCircle className="h-20 w-20 text-red-600 stroke-[1.5] relative z-10" />
              </div>
            )}
            <DialogTitle className="text-2xl font-bold mb-3 text-yellow-900 animate-text-glow">
              {popup.type === "success" ? "Success!" : "Failed!"}
            </DialogTitle>
            <p className="text-lg font-semibold mb-3 text-yellow-900 animate-fade-in-up">{popup.title}</p>
            {popup.description ? (
              <p className="text-base text-yellow-800/90 mb-4 leading-relaxed animate-fade-in-up-delayed">{popup.description}</p>
            ) : null}
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-xl border-2 border-yellow-500 bg-yellow-300 px-6 py-3 text-base font-semibold text-yellow-900 hover:bg-yellow-400 hover:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              onClick={hide}
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </FeedbackContext.Provider>
  );
};
