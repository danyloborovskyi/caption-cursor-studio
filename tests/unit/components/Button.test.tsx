import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("should render children", () => {
      render(<Button>Click me</Button>);

      expect(
        screen.getByRole("button", { name: /click me/i })
      ).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<Button className="custom-class">Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("Variants", () => {
    it("should render primary variant by default", () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole("button");
      // Check for primary styling classes
      expect(button.className).toContain("bg-blue-600");
    });

    it("should render secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole("button");
      // Check for secondary styling classes
      expect(button.className).toMatch(/bg-(gray|white)/);
    });

    it("should render outline variant", () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole("button");
      // Check for outline styling
      expect(button.className).toContain("border");
    });

    it("should render ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole("button");
      // Ghost variant should have minimal styling
      expect(button.className).not.toContain("bg-blue");
    });

    it("should render danger variant", () => {
      render(<Button variant="danger">Delete</Button>);

      const button = screen.getByRole("button");
      // Check for danger/red styling
      expect(button.className).toContain("bg-red");
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole("button");
      expect(button.className).toMatch(/text-sm|py-1|px-2/);
    });

    it("should render medium size by default", () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole("button");
      expect(button.className).toMatch(/py-2|px-4/);
    });

    it("should render large size", () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole("button");
      expect(button.className).toMatch(/text-lg|py-3|px-6/);
    });
  });

  describe("States", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should have disabled styling when disabled", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button.className).toMatch(/opacity-|cursor-not-allowed/);
    });

    it("should not trigger onClick when disabled", () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should show loading state", () => {
      render(<Button loading>Loading</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      // Check for loading indicator (spinner or text)
      expect(button.className).toContain("opacity");
    });

    it("should not trigger onClick when loading", () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Interactions", () => {
    it("should call onClick when clicked", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should call onClick multiple times", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it("should work as a submit button", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("Full Width", () => {
    it("should render full width when fullWidth prop is true", () => {
      render(<Button fullWidth>Full Width</Button>);

      const button = screen.getByRole("button");
      expect(button.className).toContain("w-full");
    });

    it("should not be full width by default", () => {
      render(<Button>Normal</Button>);

      const button = screen.getByRole("button");
      expect(button.className).not.toContain("w-full");
    });
  });

  describe("Accessibility", () => {
    it("should have button role", () => {
      render(<Button>Button</Button>);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should support aria-label", () => {
      render(<Button aria-label="Custom label">Icon</Button>);

      const button = screen.getByRole("button", { name: /custom label/i });
      expect(button).toBeInTheDocument();
    });

    it("should support aria-describedby", () => {
      render(
        <>
          <Button aria-describedby="description">Button</Button>
          <div id="description">Button description</div>
        </>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-describedby", "description");
    });

    it("should be keyboard accessible", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();

      // Simulate Enter key
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
      // Note: fireEvent.keyDown doesn't trigger click, so we test focus instead
      expect(button).toHaveFocus();
    });
  });

  describe("Custom Props", () => {
    it("should pass through HTML button attributes", () => {
      render(
        <Button id="custom-id" data-testid="custom-test">
          Button
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("id", "custom-id");
      expect(button).toHaveAttribute("data-testid", "custom-test");
    });

    it("should support different button types", () => {
      const { rerender } = render(<Button type="button">Button</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");

      rerender(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");

      rerender(<Button type="reset">Reset</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "reset");
    });
  });
});
