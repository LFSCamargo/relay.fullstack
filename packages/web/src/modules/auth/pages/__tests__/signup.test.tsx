import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMockEnvironment } from "relay-test-utils";
import { RelayEnvironmentProvider } from "react-relay";
import { SignupScreen } from "../signup";

describe("signup-page", () => {
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
  });

  function renderApp() {
    return render(
      <RelayEnvironmentProvider environment={environment}>
        <SignupScreen />
      </RelayEnvironmentProvider>,
    );
  }

  it("should render", () => {
    const { getByTestId } = renderApp();

    const loginScreen = getByTestId("signup-screen");

    expect(loginScreen).toBeInTheDocument();
  });

  it("should show validation errors when submitting empty form", async () => {
    const { getByTestId, getByText } = renderApp();

    const submitButton = getByTestId("signup-submit-button");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText("Email cannot be empty")).toBeInTheDocument();
      expect(getByText("Password cannot be empty")).toBeInTheDocument();
      expect(getByText("Name cannot be empty")).toBeInTheDocument();
    });
  });
});
