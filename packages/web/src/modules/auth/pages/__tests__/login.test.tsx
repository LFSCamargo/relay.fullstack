import { beforeEach, describe, expect, it } from "vitest";
import { LoginScreen } from "../login";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { createMockEnvironment } from "relay-test-utils";
import { RelayEnvironmentProvider } from "react-relay";

describe("login-page", () => {
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
  });

  function renderApp() {
    return render(
      <RelayEnvironmentProvider environment={environment}>
        <LoginScreen />
      </RelayEnvironmentProvider>,
    );
  }

  it("should render", () => {
    const { getByTestId } = renderApp();

    const loginScreen = getByTestId("login-screen");

    expect(loginScreen).toBeInTheDocument();
  });

  it("should show validation errors when submitting empty form", async () => {
    const { getByTestId, getByText } = renderApp();

    const submitButton = getByTestId("login-submit-button");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText("Email cannot be empty")).toBeInTheDocument();
      expect(getByText("Password cannot be empty")).toBeInTheDocument();
    });
  });
});
