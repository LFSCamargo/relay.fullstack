import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMockEnvironment } from "relay-test-utils";
import { RelayEnvironmentProvider } from "react-relay";
import { RecoverPasswordScreen } from "../recover-password";

// Mock react-router
vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe("RecoverPasswordScreen", () => {
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
  });

  function renderApp() {
    return render(
      <RelayEnvironmentProvider environment={environment}>
        <RecoverPasswordScreen />
      </RelayEnvironmentProvider>,
    );
  }

  it("should render the recover password screen", () => {
    const { getByTestId, getByText } = renderApp();

    expect(getByTestId("login-screen")).toBeInTheDocument();
    expect(getByText("Recover Password")).toBeInTheDocument();
    expect(
      getByText("Enter your email to start the password recovery process."),
    ).toBeInTheDocument();
  });

  it("should render email input field", () => {
    const { getByPlaceholderText } = renderApp();

    expect(getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    const { getByText } = renderApp();

    expect(getByText("Go to Login")).toBeInTheDocument();
    expect(getByText("Login")).toBeInTheDocument();
  });

  it("should render submit button", () => {
    const { getByTestId } = renderApp();

    const submitButton = getByTestId("login-submit-button");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveTextContent("Continue");
  });

  it("should render terms and privacy links", () => {
    const { getByText } = renderApp();

    expect(getByText("Terms of Service")).toBeInTheDocument();
    expect(getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("should show validation error when submitting empty form", async () => {
    const { getByTestId, getByText } = renderApp();

    const submitButton = getByTestId("login-submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText("Email cannot be empty")).toBeInTheDocument();
    });
  });

  it("should not show email error when valid email is provided", async () => {
    const { getByTestId, queryByText, getByPlaceholderText } = renderApp();

    // First submit empty form to trigger error
    const submitButton = getByTestId("login-submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(queryByText("Email cannot be empty")).toBeInTheDocument();
    });

    // Fill in valid email
    const emailInput = getByPlaceholderText("Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Submit again
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(queryByText("Email cannot be empty")).not.toBeInTheDocument();
      expect(queryByText("Invalid email address")).not.toBeInTheDocument();
    });
  });

  it("should show email input with correct type and testid", () => {
    const { getByTestId } = renderApp();

    const emailInput = getByTestId("login-email-input");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("placeholder", "Email");
  });

  it("should have proper form structure", () => {
    const { container } = renderApp();

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();

    const emailInput = container.querySelector('input[type="email"]');
    expect(emailInput).toBeInTheDocument();
  });
});
