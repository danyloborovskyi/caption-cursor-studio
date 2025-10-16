import React from "react";

// Base props that all card components share
interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
}

// Card component props with semantic options
interface CardProps extends BaseCardProps {
  as?: "article" | "section" | "div";
  role?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

// Main Card component with semantic HTML
export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  as: Component = "div",
  role,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}) => {
  return (
    <Component
      className={`glass glass-hover rounded-2xl ${className}`}
      role={role}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Header with semantic header element
interface CardHeaderProps extends BaseCardProps {
  as?: "header" | "div";
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
  as: Component = "header",
  ...props
}) => {
  return (
    <Component
      className={`flex flex-col space-y-3 p-8 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Title with flexible heading levels
interface CardTitleProps extends BaseCardProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  id?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = "",
  as: Component = "h3",
  id,
  ...props
}) => {
  return (
    <Component
      id={id}
      className={`text-2xl font-light leading-tight tracking-wide text-white ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Content with semantic main element option
interface CardContentProps extends BaseCardProps {
  as?: "main" | "section" | "div";
  role?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
  as: Component = "div",
  role,
  ...props
}) => {
  return (
    <Component className={`p-8 pt-0 ${className}`} role={role} {...props}>
      {children}
    </Component>
  );
};
