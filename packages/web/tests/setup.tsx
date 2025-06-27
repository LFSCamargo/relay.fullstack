import "@testing-library/jest-dom";
import { PropsWithChildren } from "react";
import { vi } from "vitest";

// Necessary for vitest to work with react-relay
global.jest = vi;

vi.mock("react-router", () => ({
  Link: ({ children }: PropsWithChildren<{ to: string }>) => (
    <span>{children}</span>
  ),
  useNavigate: () => vi.fn(),
}));

// Mock missing DOM APIs
Object.defineProperty(document, "elementFromPoint", {
  value: vi.fn(() => null),
  writable: true,
});

// Mock other potentially missing DOM APIs
Object.defineProperty(document, "caretRangeFromPoint", {
  value: vi.fn(() => null),
  writable: true,
});

Object.defineProperty(document, "caretPositionFromPoint", {
  value: vi.fn(() => null),
  writable: true,
});

// Mock ResizeObserver if needed
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver if needed
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
