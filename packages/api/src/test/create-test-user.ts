import { UserModule } from "../modules/user";

export async function createTestUser(
  email: string,
  password: string,
  name: string,
) {
  return await UserModule.resolvers.Mutation.signUp(
    {},
    {
      input: {
        email,
        password,
        name,
        clientMutationId: "1",
      },
    },
  );
}
