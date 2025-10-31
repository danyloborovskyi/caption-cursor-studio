import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "@/components/shared/LoadingState";

describe("LoadingState Component", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<LoadingState />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should render with custom message", () => {
      render(<LoadingState message="Uploading files..." />);

      expect(screen.getByText("Uploading files...")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = render(<LoadingState className="custom-class" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-class");
    });
  });

  describe("Size Variants", () => {
    it("should render small size", () => {
      const { container } = render(<LoadingState size="sm" />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-4", "w-4", "border-2");
    });

    it("should render medium size (default)", () => {
      const { container } = render(<LoadingState size="md" />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-6", "w-6", "border-2");
    });

    it("should render large size", () => {
      const { container } = render(<LoadingState size="lg" />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-8", "w-8", "border-4");
    });
  });

  describe("Accessibility", () => {
    it("should have proper role attribute", () => {
      render(<LoadingState />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should have proper aria-live attribute", () => {
      render(<LoadingState />);

      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
    });

    it("should be announced to screen readers", () => {
      render(<LoadingState message="Processing your request" />);

      const status = screen.getByRole("status");
      expect(status).toHaveTextContent("Processing your request");
    });
  });

  describe("Spinner Animation", () => {
    it("should have spinning animation class", () => {
      const { container } = render(<LoadingState />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should have border styling for spinner", () => {
      const { container } = render(<LoadingState />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass(
        "rounded-full",
        "border-b-2",
        "border-blue-500"
      );
    });
  });
});
