import { useMutation, graphql } from "react-relay";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { loginMutation } from "./__generated__/loginMutation.graphql";
import { useAuthStore } from "../stores";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PasswordInput from "@/components/ui/password-input";
import { LandingPage } from "@/components/auth/LandingPage";
import { ErrorCodesDictionary } from "@/constants";

export function LoginScreen() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    email: string;
    password: string;
  }>({
    defaultValues: {
      email: "",
      password: "",
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
      }),
    ),
  });

  const { setToken } = useAuthStore();

  const navigate = useNavigate();

  const [commit] = useMutation<loginMutation>(graphql`
    mutation loginMutation($input: LoginUserInput!) {
      login(input: $input) {
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

  const onSubmit = handleSubmit((data) => {
    const t = toast.loading("Signing into your account...");

    commit({
      variables: {
        input: {
          email: data.email,
          password: data.password,
        },
      },
      optimisticUpdater: (store, data) => {
        if (data?.login?.user && data?.login?.token) {
          const {
            user: { name, id, picture, email },
          } = data.login;

          const userRecord = store.get(id);

          if (userRecord) {
            userRecord.setValue(name, "name");
            userRecord.setValue(email, "email");
            userRecord.setValue(picture, "picture");
          }
        }
      },
      onError: (error) => {
        console.error("Login error:", error);

        toast.error("Login failed: " + error.message, {
          id: t,
        });

        return;
      },
      onCompleted: (response, errors) => {
        try {
          if (errors) {
            throw new Error(errors[0].message);
          } else if (!response.login) {
            throw new Error("Login failed");
          } else {
            const { token } = response.login;

            if (token) {
              setToken(token);
              navigate("/dashboard");
            }

            toast.success("Login successful", {
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

            console.error("Login error:", error.message);
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
        href="/auth/signup"
      >
        Create your account
      </a>
      <LandingPage />
      <div className="lg:p-8" data-testid="login-screen">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to sign in to your account
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={onSubmit}>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only">
                    Email
                  </label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    id="email"
                    placeholder="Email"
                    type="email"
                    data-testid="login-email-input"
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
                    data-testid="login-password-input"
                    {...register("password")}
                  />

                  {errors.password && (
                    <span className="text-red-500 text-xs mx-2 mb-1">
                      {errors.password.message}
                    </span>
                  )}
                </div>
                <Button data-testid="login-submit-button" type="submit">
                  Sign In with Email
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
              <Link to="/auth/signup">Create your account</Link>
            </Button>
            <Button
              asChild
              className="inline-flex items-center text-black justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <Link to="/auth/recover-password">Forgot Password</Link>
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
