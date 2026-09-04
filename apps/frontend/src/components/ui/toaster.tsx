"use client";

import React from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "danger" | "warning";
}

const ToastContext = React.createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4 sm:flex-col md:max-w-[420px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border p-4 shadow-lg transition-all ${
              toast.variant === "danger"
                ? "border-danger/20 bg-danger/10 text-danger"
                : toast.variant === "success"
                ? "border-success/20 bg-success/10 text-success"
                : toast.variant === "warning"
                ? "border-warning/20 bg-warning/10 text-warning"
                : "border-border bg-white dark:bg-muted"
            }`}
          >
            {toast.title && (
              <p className="text-sm font-semibold">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-sm opacity-80">{toast.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function Toaster() {
  return null;
}
