import { Kysely, sql } from "kysely";
import { Database } from "../types";

export async function up(db: Kysely<Database>): Promise<void> {
  sql`
    CREATE TABLE password_recovery_data(
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      otp VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL
    );
  `.execute(db);
}

export async function down(db: Kysely<Database>): Promise<void> {
  sql`
    DROP TABLE password_recovery_data;
  `.execute(db);
}
