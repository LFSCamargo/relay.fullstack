import PasswordInput from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useAuthStore } from "../stores";
import { graphql, useMutation } from "react-relay";
import { toast } from "sonner";
import type { signupMutation } from "./__generated__/signupMutation.graphql";
import { LandingPage } from "@/components/auth/LandingPage";
import { ErrorCodesDictionary } from "@/constants";

export function SignupScreen() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    email: string;
    password: string;
    name: string;
  }>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    resolver: zodResolver(
      z.object({
        email: z
          .string()
          .min(1, {
            message: "Email cannot be empty",
          })
          .email({
            message: "Invalid email address",
          }),
        password: z.string().min(1, {
          message: "Password cannot be empty",
        }),
        name: z.string().min(1, {
          message: "Name cannot be empty",
        }),
      }),
    ),
  });

  const { setToken } = useAuthStore();

  const navigate = useNavigate();

  const [commit] = useMutation<signupMutation>(graphql`
    mutation signupMutation($input: CreateUserInput!) {
      signUp(input: $input) {
        user {
          id
          name
          email
          picture
        }
        token
      }
    }
  `);

  const onSubmit = handleSubmit(async (data) => {
    const t = toast.loading("Creating your account...");
    commit({
      variables: {
        input: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      },
      optimisticUpdater: (store, data) => {
        if (data?.signUp?.user && data?.signUp?.token) {
          const {
            user: { name, id, picture, email },
          } = data.signUp;

          const userRecord = store.get(id);

          if (userRecord) {
            userRecord.setValue(name, "name");
            userRecord.setValue(email, "email");
            userRecord.setValue(picture, "picture");
          }
        }
      },
      onError: (error) => {
        console.error("Error creating account:", error);
        toast.error("Error creating account: " + error.message, {
          id: t,
        });

        return;
      },
      onCompleted: (response, errors) => {
        try {
          if (errors) {
            throw new Error(errors[0].message);
          } else if (!response.signUp) {
            throw new Error("Error creating account: Unexpected error");
          } else {
            const { token } = response.signUp;

            if (token) {
              setToken(token);
              navigate("/dashboard");
            }

            toast.success("Your account has been created", {
              id: t,
            });
          }
        } catch (error) {
          // Handle error
          if (error instanceof Error) {
            const message = ErrorCodesDictionary[error.message];

            if (message) {
              toast.error(message, {
                id: t,
              });
              return;
            }
            toast.error("Login failed: " + error.message, {
              id: t,
            });
          }
        }
      },
    });
  });

  return (
    <div className="container relative hidden min-h-[100vh] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <a
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 absolute right-4 top-4 md:right-8 md:top-8"
        href="/auth/login"
      >
        Login
      </a>
      <LandingPage />
      <div className="lg:p-8" data-testid="signup-screen">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your name, email and password to create a new account
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={onSubmit}>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    id="name"
                    placeholder="Name"
                    type="text"
                    {...register("name")}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs mx-2 mb-1">
                      {errors.name.message}
                    </span>
                  )}

                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    id="email"
                    placeholder="Email"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs mx-2 mb-1">
                      {errors.email.message}
                    </span>
                  )}

                  <PasswordInput
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    id="password"
                    placeholder="Password"
                    value={watch("password")}
                    {...register("password")}
                  />
                  {errors.password && (
                    <span className="text-red-500 text-xs mx-2 mb-1">
                      {errors.password.message}
                    </span>
                  )}
                </div>
                <Button type="submit" data-testid="signup-submit-button">
                  Create your account
                </Button>
              </div>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button
              asChild
              className="inline-flex items-center text-black justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <Link to="/auth/login">Login with Email and password</Link>
            </Button>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="/terms"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="/privacy"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
