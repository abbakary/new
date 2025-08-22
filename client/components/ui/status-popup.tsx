import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
          className="max-w-md border-yellow-300 bg-yellow-100 text-yellow-950 shadow-2xl rounded-2xl p-0"
          aria-describedby={undefined}
        >
          <div className="flex flex-col items-center text-center p-6">
            {popup.type === "success" ? (
              <div className="mb-3">
                <CheckCircle className="h-14 w-14 text-green-600" />
              </div>
            ) : (
              <div className="mb-3">
                <XCircle className="h-14 w-14 text-red-600" />
              </div>
            )}
            <h3 className="text-xl font-bold mb-1">
              {popup.type === "success" ? "Success" : "Failed"}
            </h3>
            <p className="text-base font-medium mb-2">{popup.title}</p>
            {popup.description ? (
              <p className="text-sm text-yellow-900/80">{popup.description}</p>
            ) : null}
            <button
              type="button"
              className="mt-5 inline-flex items-center justify-center rounded-md border border-yellow-400 bg-yellow-200 px-4 py-2 text-sm font-medium hover:bg-yellow-300 focus:outline-none"
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
