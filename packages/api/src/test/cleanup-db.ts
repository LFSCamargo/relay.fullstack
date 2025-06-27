import { db } from "../db";

export async function cleanupDb() {
  await db.deleteFrom("user_data").execute();
  await db.deleteFrom("password_recovery_data").execute();
}
