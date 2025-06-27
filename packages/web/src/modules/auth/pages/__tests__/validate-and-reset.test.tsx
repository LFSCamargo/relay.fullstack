import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMockEnvironment } from "relay-test-utils";
import { RelayEnvironmentProvider } from "react-relay";
import { ValidateAndResetScreen } from "../validate-and-reset";

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

describe("ValidateAndResetScreen", () => {
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
  });

  function renderApp() {
    return render(
      <RelayEnvironmentProvider environment={environment}>
        <ValidateAndResetScreen />
      </RelayEnvironmentProvider>,
    );
  }

  it("should render the validate and reset screen", () => {
    const { getByTestId, getByText } = renderApp();

    expect(getByTestId("login-screen")).toBeInTheDocument();
    expect(getByText("Validate and Reset Password")).toBeInTheDocument();
    expect(
      getByText("Enter the OTP sent to your email and set a new password."),
    ).toBeInTheDocument();
  });

  it("should render OTP input slots", () => {
    const { container } = renderApp();

    // Check if all 6 OTP slots are rendered
    const otpSlots = container.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(otpSlots).toHaveLength(6);
  });

  it("should render password input fields", () => {
    const { getByPlaceholderText } = renderApp();

    expect(getByPlaceholderText("Password")).toBeInTheDocument();
    expect(getByPlaceholderText("Confirm Password")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    const { getByText } = renderApp();

    expect(getByText("Back to Recovery")).toBeInTheDocument();
    expect(getByText("Login")).toBeInTheDocument();
  });

  it("should show validation errors when submitting empty form", async () => {
    const { getByTestId, getByText } = renderApp();

    const submitButton = getByTestId("login-submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText("OTP cannot be empty")).toBeInTheDocument();
      expect(getByText("Password cannot be empty")).toBeInTheDocument();
      expect(getByText("Confirm Password cannot be empty")).toBeInTheDocument();
    });
  });

  it("should show error when passwords do not match", async () => {
    const { getByTestId, getByText, getByPlaceholderText, container } =
      renderApp();

    // Fill in a valid OTP
    const otpInput = container.querySelector('input[type="tel"]');
    if (otpInput) {
      fireEvent.change(otpInput, { target: { value: "123456" } });
    }

    // Fill in different passwords
    const passwordInput = getByPlaceholderText("Password");
    const confirmPasswordInput = getByPlaceholderText("Confirm Password");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password456" },
    });

    const submitButton = getByTestId("login-submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("should not show password mismatch error when passwords match", async () => {
    const { getByTestId, queryByText, getByPlaceholderText, container } =
      renderApp();

    // Fill in a valid OTP
    const otpInput = container.querySelector('input[type="tel"]');
    if (otpInput) {
      fireEvent.change(otpInput, { target: { value: "123456" } });
    }

    // Fill in matching passwords
    const passwordInput = getByPlaceholderText("Password");
    const confirmPasswordInput = getByPlaceholderText("Confirm Password");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    const submitButton = getByTestId("login-submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(queryByText("Passwords do not match")).not.toBeInTheDocument();
    });
  });
});
