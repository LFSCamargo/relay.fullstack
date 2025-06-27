import { toGlobalId } from "graphql-relay";
import { UserData } from "../../../db/types/tables";

export const User = {
  id: (user: UserData) => toGlobalId("User", Number(user.id)),
};
