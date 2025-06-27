import { it, describe, expect } from "vitest";
import { useAuthStore } from "../auth";

describe("useAuthStore", () => {
  it("should return null for token when user is not logged in", () => {
    const { token } = useAuthStore.getState();
    expect(token).toBeNull();
  });

  it("should set token and clear token", () => {
    const { clearToken, setToken, token } = useAuthStore.getState();

    expect(token).toBeNull();
    setToken("test-token");
    expect(useAuthStore.getState().token).toBe("test-token");
    clearToken();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
