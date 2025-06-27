import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { LandingPage } from "@/components/auth/LandingPage";
import { graphql, useMutation } from "react-relay";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import PasswordInput from "@/components/ui/password-input";
import type { validateAndResetMutation } from "./__generated__/validateAndResetMutation.graphql";
import { ErrorCodesDictionary } from "@/constants";

export function ValidateAndResetScreen() {
  const [commit, isInFlight] = useMutation<validateAndResetMutation>(graphql`
    mutation validateAndResetMutation($input: ValidateOTPResetPasswordInput!) {
      validateOTPResetPassword(input: $input) {
        message
      }
    }
  `);

  const formSchema = z
    .object({
      otp: z
        .string()
        .min(1, {
          message: "OTP cannot be empty",
        })
        .min(6, {
          message: "OTP must be at least 6 characters",
        }),
      password: z.string().min(1, {
        message: "Password cannot be empty",
      }),
      confirmPassword: z.string().min(1, {
        message: "Confirm Password cannot be empty",
      }),
    })
    .refine(
      (schema) => {
        return schema.password === schema.confirmPassword;
      },
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      },
    );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<{
    otp: string;
    password: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(formSchema),
  });

  const navigate = useNavigate();

  const submitHandler: SubmitHandler<{
    otp: string;
    password: string;
    confirmPassword: string;
  }> = ({ otp, password }) => {
    const t = toast.loading("Validating OTP and resetting password...");
    commit({
      variables: {
        input: {
          otp,
          password,
        },
      },
      onCompleted: (response, errors) => {
        toast.dismiss(t);
        if (errors) {
          console.log(errors[0].message);
          toast.error(
            `Error: ${ErrorCodesDictionary[errors[0].message] || errors[0].message}`,
          );
          return;
        }
        toast.success(response.validateOTPResetPassword?.message);
        navigate("/auth/login");
      },
      onError: (error) => {
        toast.dismiss(t);
        toast.error(`Error: ${error.message}`);
      },
    });
  };

  const onSubmit = handleSubmit(submitHandler);

  return (
    <div className="container relative hidden min-h-[100vh] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <a
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 absolute right-4 top-4 md:right-8 md:top-8"
        href="/auth/recover-password"
      >
        Back to Recovery
      </a>
      <LandingPage />
      <div className="lg:p-8" data-testid="login-screen">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Validate and Reset Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the OTP sent to your email and set a new password.
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={onSubmit}>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <div className="flex items-center justify-center gap-2 flex-col mb-4">
                    <InputOTP
                      {...register("otp")}
                      id="otp"
                      value={watch("otp")}
                      onChange={(otp: string) => {
                        setValue("otp", otp);
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    {errors.otp && (
                      <span className="text-red-500 text-xs mx-2 mb-1">
                        {errors.otp.message}
                      </span>
                    )}
                  </div>

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

                  <PasswordInput
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    value={watch("confirmPassword")}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-xs mx-2 mb-1">
                      {errors.confirmPassword.message}
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
        </div>
      </div>
    </div>
  );
}
