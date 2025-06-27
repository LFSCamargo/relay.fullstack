import { Kysely, sql } from "kysely";
import { Database } from "../types";

export async function up(db: Kysely<Database>): Promise<void> {
  sql`
    CREATE TABLE user_data (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      picture TEXT,
      created_at TIMESTAMP NOT NULL
    );
  `.execute(db);
}

export async function down(db: Kysely<Database>): Promise<void> {
  sql`
    DROP TABLE user_data;
  `.execute(db);
}
