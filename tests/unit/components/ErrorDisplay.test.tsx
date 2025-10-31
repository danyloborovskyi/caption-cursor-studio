import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorDisplay, InlineError } from "@/components/shared/ErrorDisplay";

describe("ErrorDisplay Component", () => {
  describe("Rendering", () => {
    it("should render error message", () => {
      render(<ErrorDisplay error="Something went wrong" />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("should render with custom title", () => {
      render(<ErrorDisplay error="Error message" title="Upload Failed" />);

      expect(screen.getByText("Upload Failed")).toBeInTheDocument();
      expect(screen.getByText("Error message")).toBeInTheDocument();
    });

    it("should render without title when not provided", () => {
      render(<ErrorDisplay error="Error message" />);

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render error variant by default", () => {
      const { container } = render(<ErrorDisplay error="Error" />);

      const wrapper = container.querySelector('[role="alert"]');
      expect(wrapper).toHaveClass(
        "bg-red-500/10",
        "border-red-500/30",
        "text-red-300"
      );
    });

    it("should render warning variant", () => {
      const { container } = render(
        <ErrorDisplay error="Warning" variant="warning" />
      );

      const wrapper = container.querySelector('[role="alert"]');
      expect(wrapper).toHaveClass(
        "bg-yellow-500/10",
        "border-yellow-500/30",
        "text-yellow-300"
      );
    });

    it("should render info variant", () => {
      const { container } = render(
        <ErrorDisplay error="Info" variant="info" />
      );

      const wrapper = container.querySelector('[role="alert"]');
      expect(wrapper).toHaveClass(
        "bg-blue-500/10",
        "border-blue-500/30",
        "text-blue-300"
      );
    });

    it("should display correct icon for each variant", () => {
      const { rerender, container } = render(
        <ErrorDisplay error="Test" variant="error" />
      );
      expect(container.textContent).toContain("⚠️");

      rerender(<ErrorDisplay error="Test" variant="warning" />);
      expect(container.textContent).toContain("⚡");

      rerender(<ErrorDisplay error="Test" variant="info" />);
      expect(container.textContent).toContain("ℹ️");
    });
  });

  describe("Actions", () => {
    it("should render retry button when onRetry provided", () => {
      const handleRetry = vi.fn();
      render(<ErrorDisplay error="Error" onRetry={handleRetry} />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });

    it("should call onRetry when retry button clicked", () => {
      const handleRetry = vi.fn();
      render(<ErrorDisplay error="Error" onRetry={handleRetry} />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(retryButton);

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("should render dismiss button when onDismiss provided", () => {
      const handleDismiss = vi.fn();
      render(<ErrorDisplay error="Error" onDismiss={handleDismiss} />);

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      expect(dismissButton).toBeInTheDocument();
    });

    it("should call onDismiss when dismiss button clicked", () => {
      const handleDismiss = vi.fn();
      render(<ErrorDisplay error="Error" onDismiss={handleDismiss} />);

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it("should not render action buttons when no callbacks provided", () => {
      render(<ErrorDisplay error="Error" />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should render both retry and dismiss buttons", () => {
      render(
        <ErrorDisplay error="Error" onRetry={vi.fn()} onDismiss={vi.fn()} />
      );

      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /dismiss/i })
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it('should have role="alert" for screen readers', () => {
      render(<ErrorDisplay error="Error" />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should be announced to screen readers", () => {
      render(<ErrorDisplay error="Critical error occurred" />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Critical error occurred");
    });
  });
});

describe("InlineError Component", () => {
  describe("Rendering", () => {
    it("should render error message", () => {
      render(<InlineError error="Invalid input" />);

      expect(screen.getByText("Invalid input")).toBeInTheDocument();
    });

    it("should have error text styling", () => {
      render(<InlineError error="Error" />);

      const element = screen.getByRole("alert");
      expect(element).toHaveClass("text-sm", "text-red-400", "mt-1");
    });

    it("should apply custom className", () => {
      render(<InlineError error="Error" className="custom-class" />);

      const element = screen.getByRole("alert");
      expect(element).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it('should have role="alert"', () => {
      render(<InlineError error="Error" />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
