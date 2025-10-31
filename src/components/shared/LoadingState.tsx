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
}

export function LoadingState({
  message = "Loading...",
  size = "md",
  fullScreen = false,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
      <p className={`text-gray-400 ${textSizeClasses[size]}`}>{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{spinner}</div>
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
