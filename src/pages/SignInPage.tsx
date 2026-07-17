import { useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { authStore } from "../shared/auth/authStore";
import { useSignIn } from "../features/auth";
import { FloatingInput } from "../shared/components/FloatingInput";
import { Button } from "../shared/components/Button";
import { ApiError } from "../shared/api/httpClient";

const signInSchema = z.object({
  userNameOrEmail: z.string().min(5, "Must be at least 5 characters"),
  password: z.string().min(9, "Must be at least 9 characters"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSyncExternalStore(
    authStore.subscribe,
    authStore.isAuthenticated,
  );
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const signIn = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { userNameOrEmail: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/admin", { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  function onSubmit(values: SignInFormValues) {
    signIn.mutate(values, {
      onSuccess: (data) => {
        authStore.setToken(data.accessToken.token, data.accessToken.expiresAtUtc);
      },
    });
  }

  return (
    <div className="flex flex-1 items-start justify-center px-4 pt-16 md:pt-24">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-bg-surface/60 p-10 shadow-xl backdrop-blur-md">
        <h1 className="sr-only">Sign In</h1>
        <div className="mb-12 flex justify-center">
          <LogIn className="h-20 w-20 text-accent-dark" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <FloatingInput
              id="userNameOrEmail"
              type="text"
              label="Username or Email"
              error={errors.userNameOrEmail?.message}
              {...register("userNameOrEmail")}
            />
            <FloatingInput
              id="password"
              type={passwordRevealed ? "text" : "password"}
              label="Password"
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  aria-label={passwordRevealed ? "Hide password" : "Show password"}
                  className="rounded-md p-1 text-text-secondary transition-colors duration-300 hover:text-accent"
                  style={{ touchAction: "manipulation" }}
                  onMouseDown={() => setPasswordRevealed(true)}
                  onMouseUp={() => setPasswordRevealed(false)}
                  onMouseLeave={() => setPasswordRevealed(false)}
                  onTouchStart={() => setPasswordRevealed(true)}
                  onTouchEnd={() => setPasswordRevealed(false)}
                  onTouchCancel={() => setPasswordRevealed(false)}
                >
                  {passwordRevealed ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
              {...register("password")}
            />
          </div>
          <div className="mt-9">
            {signIn.error instanceof ApiError && (
              <p className="mb-3 text-center text-sm text-danger">
                {signIn.error.message}
              </p>
            )}
            <Button
              type="submit"
              isLoading={signIn.isPending}
              className="mx-auto w-1/2 rounded-lg bg-accent-dark px-4 py-2 font-medium text-text-primary transition-colors duration-300 ease-out hover:bg-accent-dark/80"
            >
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
