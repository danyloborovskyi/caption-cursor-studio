import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    "glass-button inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-blue-600 text-white shadow-lg hover:shadow-xl border-white/30 hover:bg-blue-700",
    secondary:
      "bg-gray-700 text-white/90 hover:text-white border-white/20 hover:bg-gray-600",
    outline:
      "border-white/40 text-white hover:bg-white/10 hover:border-white/60",
    ghost: "text-white hover:bg-white/10 border-transparent",
    danger:
      "bg-red-600 text-white shadow-lg hover:bg-red-700 border-red-500/30",
  };

  const sizes = {
    sm: "h-9 px-2 py-1 text-sm font-light",
    md: "h-11 px-4 py-2 font-light",
    lg: "h-14 px-6 py-3 text-lg font-light",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

  return (
    <button className={buttonStyles} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
