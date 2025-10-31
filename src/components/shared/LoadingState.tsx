/**
 * Shared Loading State Component
 *
 * Reusable loading indicator to replace duplicate loading states
 * across Gallery.tsx, MyGallery.tsx, and other components.
 */

interface LoadingStateProps {
  /** Loading message to display */
  message?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show full-screen overlay */
  fullScreen?: boolean;
  /** Custom className */
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  size = "md",
  fullScreen = false,
  className = "",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-4",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const spinner = (
    <div
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={`${sizeClasses[size]} border-blue-500 border-b-2 rounded-full animate-spin`}
      />
      <p className={`text-white/70 ${textSizeClasses[size]}`}>{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${className}`}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      {spinner}
    </div>
  );
}

/**
 * Skeleton Loader Component
 *
 * Loading placeholder for content
 */
interface SkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
  /** Height of skeleton items */
  height?: string;
  /** Custom className */
  className?: string;
}

export function Skeleton({
  count = 1,
  height = "h-48",
  className = "",
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} ${className} glass rounded-xl animate-pulse bg-gray-700/50`}
        />
      ))}
    </>
  );
}
