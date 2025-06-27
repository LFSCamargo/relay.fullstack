import { describe, it, expect } from "vitest";
import { createHttpServer } from "../server";

describe("server.ts > createHTTPServer", () => {
  it("should create a http server", async () => {
    const { httpServer } = await createHttpServer();

    expect(httpServer).toBeDefined();
    expect(httpServer.address()).toBeDefined();

    httpServer.close();
  });
});
