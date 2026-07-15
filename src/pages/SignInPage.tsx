import { useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authStore } from "../shared/auth/authStore";
import { useSignIn } from "../features/auth";

const signInSchema = z.object({
  userNameOrEmail: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const inputClasses =
  "w-full rounded-lg border border-border-default bg-bg-base/50 px-3 py-2 text-text-primary placeholder:text-text-secondary transition-colors focus:border-accent focus:outline-none";

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
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  function onSubmit(values: SignInFormValues) {
    signIn.mutate(values, {
      onSuccess: (data) => {
        authStore.setToken(data.accessToken.token, data.accessToken.expiresAtUtc);
        navigate("/admin");
      },
    });
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border-default bg-bg-surface/60 p-8 shadow-xl backdrop-blur-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-text-primary">
          Sign In
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="userNameOrEmail"
              className="mb-1 block text-sm text-text-secondary"
            >
              Username or Email
            </label>
            <input
              id="userNameOrEmail"
              type="text"
              className={inputClasses}
              {...register("userNameOrEmail")}
            />
            {errors.userNameOrEmail && (
              <p className="mt-1 text-sm text-danger">
                {errors.userNameOrEmail.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm text-text-secondary"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={passwordRevealed ? "text" : "password"}
                className={`${inputClasses} pr-14`}
                {...register("password")}
              />
              <button
                type="button"
                aria-label={passwordRevealed ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-text-secondary transition-colors hover:text-accent"
                style={{ touchAction: "manipulation" }}
                onMouseDown={() => setPasswordRevealed(true)}
                onMouseUp={() => setPasswordRevealed(false)}
                onMouseLeave={() => setPasswordRevealed(false)}
                onTouchStart={() => setPasswordRevealed(true)}
                onTouchEnd={() => setPasswordRevealed(false)}
                onTouchCancel={() => setPasswordRevealed(false)}
              >
                {passwordRevealed ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-danger">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={signIn.isPending}
            className="w-full rounded-lg bg-accent px-4 py-2 font-medium text-bg-base transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
