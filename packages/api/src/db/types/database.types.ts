import { UserData, PasswordRecoveryData } from "./tables";

export type Database = {
  user_data: UserData;
  password_recovery_data: PasswordRecoveryData;
};
