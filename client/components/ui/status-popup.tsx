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
          className="max-w-lg border-2 border-yellow-400 bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-100 text-yellow-950 shadow-2xl rounded-3xl p-0 backdrop-blur-sm"
          aria-describedby={undefined}
        >
          <div className="flex flex-col items-center text-center p-8">
            {popup.type === "success" ? (
              <div className="mb-6 bg-green-100 rounded-full p-4 shadow-lg">
                <CheckCircle className="h-20 w-20 text-green-600 stroke-[1.5]" />
              </div>
            ) : (
              <div className="mb-6 bg-red-100 rounded-full p-4 shadow-lg">
                <XCircle className="h-20 w-20 text-red-600 stroke-[1.5]" />
              </div>
            )}
            <h3 className="text-2xl font-bold mb-3 text-yellow-900">
              {popup.type === "success" ? "Success!" : "Failed!"}
            </h3>
            <p className="text-lg font-semibold mb-3 text-yellow-900">{popup.title}</p>
            {popup.description ? (
              <p className="text-base text-yellow-800/90 mb-4 leading-relaxed">{popup.description}</p>
            ) : null}
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-xl border-2 border-yellow-500 bg-yellow-300 px-6 py-3 text-base font-semibold text-yellow-900 hover:bg-yellow-400 hover:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
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
