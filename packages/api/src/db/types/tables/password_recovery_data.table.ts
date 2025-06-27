import { ColumnType, Generated } from "kysely";

export interface PasswordRecoveryData {
  id: Generated<number> | number;
  user_email: string;
  otp: string;
  expires_at: ColumnType<Date, string>;
  used: boolean;
  created_at: ColumnType<Date, string>;
}
