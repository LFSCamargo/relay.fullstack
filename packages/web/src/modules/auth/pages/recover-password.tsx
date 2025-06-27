import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { LandingPage } from "@/components/auth/LandingPage";
import { graphql, useMutation } from "react-relay";
import { toast } from "sonner";
import { type recoverPasswordMutation } from "./__generated__/recoverPasswordMutation.graphql";
import { Routes } from "@/router/routes";
import { ErrorCodesDictionary } from "@/constants";

export function RecoverPasswordScreen() {
  const [commit, isInFlight] = useMutation<recoverPasswordMutation>(graphql`
    mutation recoverPasswordMutation($input: ResetPasswordInput!) {
      recoverPassword(input: $input) {
        message
      }
    }
  `);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    email: string;
  }>({
    defaultValues: {
      email: "",
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
      }),
    ),
  });

  const navigate = useNavigate();
  const onSubmit: SubmitHandler<{ email: string }> = ({ email }) => {
    const t = toast.loading("Sending password recovery email...");
    commit({
      variables: {
        input: {
          email,
        },
      },
      onCompleted: (response, errors) => {
        if (errors || !response.recoverPassword) {
          console.error(errors);
          toast.error(
            ErrorCodesDictionary[errors![0].message] ||
              "Error sending password recovery email",
            {
              id: t,
            },
          );
        } else {
          toast.success(response.recoverPassword?.message, {
            id: t,
          });
          // Optionally navigate to a different page after successful submission
          navigate(Routes.ValidateAndReset);
        }
      },
    });
  };

  return (
    <div className="container relative hidden min-h-[100vh] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <a
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 absolute right-4 top-4 md:right-8 md:top-8"
        href="/auth/login"
      >
        Go to Login
      </a>
      <LandingPage />
      <div className="lg:p-8" data-testid="login-screen">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Recover Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to start the password recovery process.
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
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
                </div>
                <Button
                  disabled={isInFlight}
                  data-testid="login-submit-button"
                  type="submit"
                >
                  Continue
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
              <Link to="/auth/login">Login</Link>
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
