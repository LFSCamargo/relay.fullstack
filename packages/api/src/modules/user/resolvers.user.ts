import {
  login,
  recoverPassword,
  signUp,
  updateUser,
  validateOTPResetPassword,
} from "./mutations";
import { me } from "./queries";
import { User } from "./type-resolvers";

export const UserResolvers = {
  User: {
    id: User.id,
  },
  Query: {
    me,
  },
  Mutation: {
    signUp,
    login,
    updateUser,
    recoverPassword,
    validateOTPResetPassword,
  },
};
