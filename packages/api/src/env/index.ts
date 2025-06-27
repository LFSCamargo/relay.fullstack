import { config } from "dotenv";

config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

export const Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 4000,
  SECRET: process.env.SECRET || "secret",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || 5432,
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
  DB_NAME: process.env.DB_NAME || "app_db",
  SMTP_HOST: process.env.SMTP_HOST || "localhost",
  SMTP_PORT: process.env.SMTP_PORT || 1025,
  SMTP_SECURE: process.env.SMTP_SECURE || "false",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
};
