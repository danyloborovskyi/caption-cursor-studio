import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "glass-button inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary: "text-white shadow-lg hover:shadow-xl border-white/30",
    secondary: "text-white/90 hover:text-white border-white/20",
    outline:
      "border-white/40 text-white hover:bg-white/10 hover:border-white/60",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm font-light",
    md: "h-11 px-6 py-2 font-light",
    lg: "h-14 px-8 text-lg font-light",
  };

  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={buttonStyles} {...props}>
      {children}
    </button>
  );
};
