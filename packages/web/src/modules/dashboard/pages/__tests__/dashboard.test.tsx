import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardScreen } from "../dashboard";
import { act, render, waitFor } from "@testing-library/react";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import {
  RelayEnvironmentProvider,
  type OperationDescriptor,
} from "react-relay";
import { Suspense } from "react";

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("login-page", () => {
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
  });

  function renderApp() {
    return render(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardScreen />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  }

  it("should render", async () => {
    const { getByText } = renderApp();

    expect(getByText("Loading...")).toBeInTheDocument();

    act(() => {
      environment.mock.resolveMostRecentOperation(
        (operation: OperationDescriptor) =>
          MockPayloadGenerator.generate(operation, {
            User: () => ({
              id: "1",
              name: "John Doe",
              email: "nDg0l@example.com",
              picture: null,
            }),
          }),
      );
    });

    await waitFor(() => {
      expect(getByText("John Doe")).toBeInTheDocument();
      expect(getByText("nDg0l@example.com")).toBeInTheDocument();
    });
  });
});
