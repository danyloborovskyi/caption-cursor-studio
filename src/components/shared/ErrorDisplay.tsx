/**
 * Shared Error Display Component
 *
 * Reusable error display to replace duplicate error handling
 * across components. Provides consistent UX for errors.
 */

interface ErrorDisplayProps {
  /** Error message to display */
  error: string;
  /** Optional error title */
  title?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Optional dismiss callback */
  onDismiss?: () => void;
  /** Variant style */
  variant?: "error" | "warning" | "info";
}

export function ErrorDisplay({
  error,
  title,
  onRetry,
  onDismiss,
  variant = "error",
}: ErrorDisplayProps) {
  const variantStyles = {
    error: "bg-red-500/10 border-red-500/30 text-red-300",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  };

  const iconMap = {
    error: "⚠️",
    warning: "⚡",
    info: "ℹ️",
  };

  return (
    <div
      className={`${variantStyles[variant]} rounded-xl border p-6 my-4`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{iconMap[variant]}</span>
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-2 text-white">{title}</h3>}
          <p className="text-sm">{error}</p>

          {(onRetry || onDismiss) && (
            <div className="flex gap-3 mt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Error Message
 *
 * Smaller error display for forms and inline validation
 */
interface InlineErrorProps {
  error: string;
  className?: string;
}

export function InlineError({ error, className = "" }: InlineErrorProps) {
  return (
    <p className={`text-sm text-red-400 mt-1 ${className}`} role="alert">
      {error}
    </p>
  );
}
