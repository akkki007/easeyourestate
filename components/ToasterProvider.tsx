"use client";

import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--color-surface-elevated)",
          color: "var(--color-text-primary)",
          borderRadius: "12px",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-md)",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#0a0a0a",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#0a0a0a",
          },
        },
      }}
    />
  );
}

