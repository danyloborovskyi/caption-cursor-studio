"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info" | "primary";
  isLoading?: boolean;
  children?: React.ReactNode;
  confirmClassName?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "warning",
  isLoading = false,
  children,
  confirmClassName,
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const variantStyles = {
    danger: {
      icon: "text-red-400",
      iconBg: "bg-red-500/20",
      border: "border-red-500/50",
      button: "!bg-red-500 hover:!bg-red-600",
    },
    warning: {
      icon: "text-yellow-400",
      iconBg: "bg-yellow-500/20",
      border: "border-yellow-500/50",
      button: "!bg-yellow-500 hover:!bg-yellow-600",
    },
    info: {
      icon: "text-blue-400",
      iconBg: "bg-blue-500/20",
      border: "border-blue-500/50",
      button: "!bg-blue-500 hover:!bg-blue-600",
    },
    primary: {
      icon: "text-blue-400",
      iconBg: "bg-blue-500/20",
      border: "border-blue-500/50",
      button: "!bg-blue-500 hover:!bg-blue-600",
    },
  };

  const styles = variantStyles[variant];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative glass rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4 mx-auto`}
        >
          {variant === "danger" && (
            <svg
              className={`w-6 h-6 ${styles.icon}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {variant === "warning" && (
            <svg
              className={`w-6 h-6 ${styles.icon}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {(variant === "info" || variant === "primary") && (
            <svg
              className={`w-6 h-6 ${styles.icon}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-white/70 text-center mb-6 text-sm leading-relaxed">
          {message}
        </p>

        {/* Optional children (e.g., form inputs) */}
        {children && <div className="mb-6">{children}</div>}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${styles.button} ${confirmClassName || ""}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
