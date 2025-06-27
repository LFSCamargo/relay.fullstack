import { describe, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  graphql,
  type OperationDescriptor,
} from "react-relay";
import { act, Suspense } from "react";
import { EditUserProfileCard } from "../EditUserProfileCard";
import type { EditUserProfileCard_user$key } from "../__generated__/EditUserProfileCard_user.graphql";
import type { EditUserProfileCardQuery } from "./__generated__/EditUserProfileCardQuery.graphql";

const successToast = vi.fn();
const loadingToast = vi.fn();
const errorToast = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: <T = unknown,>(...args: T[]) => successToast(...args),
    loading: <T = unknown,>(...args: T[]) => loadingToast(...args),
    error: <T = unknown,>(...args: T[]) => errorToast(...args),
  },
}));

function EditUserProfileCardWrapper() {
  const data = useLazyLoadQuery<EditUserProfileCardQuery>(
    graphql`
      query EditUserProfileCardQuery {
        me {
          ...EditUserProfileCard_user
        }
      }
    `,
    {},
    { fetchPolicy: "store-or-network" },
  );

  return <EditUserProfileCard user={data.me as EditUserProfileCard_user$key} />;
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
          <EditUserProfileCardWrapper />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  }

  it("should render the user information", async () => {
    const { getByText, getByTestId } = renderApp();

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
      expect(getByTestId("avatar-edit-profile")).toBeInTheDocument();
    });
  });

  it("should handle form submission", async () => {
    const { getByText, getByTestId } = renderApp();

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
      expect(getByTestId("avatar-edit-profile")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.input(getByTestId("name-input-edit-profile"), {
        target: { value: "Jane Doe" },
      });
    });

    act(() => {
      fireEvent.input(getByTestId("name-input-edit-profile"), {
        target: { value: "Jane Doe" },
      });
    });

    await waitFor(() => {
      expect(getByTestId("name-input-edit-profile")).toHaveValue("Jane Doe");
    });
  });

  it("should show validation errors when submitting empty form", async () => {
    const { getByTestId, getByText } = renderApp();

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
      expect(getByTestId("avatar-edit-profile")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.input(getByTestId("name-input-edit-profile"), {
        target: { value: "" },
      });
    });

    act(() => {
      fireEvent.click(getByTestId("save-profile-button"));
    });

    await waitFor(() => {
      expect(getByText("Name cannot be empty")).toBeInTheDocument();
    });
  });
});
