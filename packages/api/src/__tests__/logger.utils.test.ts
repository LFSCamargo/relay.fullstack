import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoggingUtility } from "../utils/logger.utils";
import debug from "debug";

// Mock the debug module
vi.mock("debug", () => {
  const mockDebug = vi.fn();
  mockDebug.enabled = true;
  return {
    default: vi.fn(() => mockDebug),
  };
});

describe("logger.utils.ts > LoggingUtility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call debug with correct namespace and message", () => {
    const message = "test debug message";
    LoggingUtility.debug(message);

    expect(debug).toHaveBeenCalledWith(
      "graphql:server:debug:test debug message",
    );
    const mockDebug = debug();
    expect(mockDebug).toHaveBeenCalledWith(message);
  });

  it("should call info with correct namespace and message", () => {
    const message = "test info message";
    LoggingUtility.info(message);

    expect(debug).toHaveBeenCalledWith("graphql:server:info:test info message");
    const mockDebug = debug();
    expect(mockDebug).toHaveBeenCalledWith(message);
  });

  it("should call error with correct namespace and message", () => {
    const message = "test error message";
    LoggingUtility.error(message);

    expect(debug).toHaveBeenCalledWith(
      "graphql:server:error:test error message",
    );
    const mockDebug = debug();
    expect(mockDebug).toHaveBeenCalledWith(message);
  });

  it("should handle empty messages", () => {
    const message = "";
    LoggingUtility.debug(message);

    expect(debug).toHaveBeenCalledWith("graphql:server:debug:");
    const mockDebug = debug();
    expect(mockDebug).toHaveBeenCalledWith(message);
  });

  it("should handle messages with special characters", () => {
    const message = "test message with !@#$%^&*()";
    LoggingUtility.debug(message);

    expect(debug).toHaveBeenCalledWith(
      "graphql:server:debug:test message with !@#$%^&*()",
    );
    const mockDebug = debug();
    expect(mockDebug).toHaveBeenCalledWith(message);
  });
});
