import { describe, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  graphql,
  type OperationDescriptor,
} from "react-relay";
import { UserInformationCard } from "../UserInformationCard";
import type { UserInformationCard_user$key } from "../__generated__/UserInformationCard_user.graphql";
import type { UserInformationCardQuery } from "./__generated__/UserInformationCardQuery.graphql";
import { act, Suspense } from "react";

const navigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

function UserInformationCardWrapper() {
  const data = useLazyLoadQuery<UserInformationCardQuery>(
    graphql`
      query UserInformationCardQuery {
        me {
          ...UserInformationCard_user
        }
      }
    `,
    {},
    { fetchPolicy: "store-or-network" },
  );

  return <UserInformationCard user={data.me as UserInformationCard_user$key} />;
}

describe("UserInformationCard", () => {
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
  });

  function renderApp() {
    return render(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={<div>Loading...</div>}>
          <UserInformationCardWrapper />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  }

  it("should render the user information", async () => {
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
    });
  });

  it("should render the user information and logout button", async () => {
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
    });

    expect(getByText("Logout")).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByText("Logout"));
    });

    expect(navigate).toHaveBeenCalledWith("/auth/login");
  });
});
