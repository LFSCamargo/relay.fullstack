import dotenv from "dotenv";
import { vi } from "vitest";

dotenv.config({
  path: ".env.test",
});

vi.mock("../src/utils/mailing.utils", () => ({
  MailingUtils: {
    sendResetPasswordEmail: vi.fn(),
  },
}));

vi.mock("ws", () => {
  const WebSocketServer = vi.fn().mockImplementation(() => ({
    close: vi.fn(),
  }));

  return {
    WebSocketServer,
    default: {
      WebSocketServer,
    },
  };
});
