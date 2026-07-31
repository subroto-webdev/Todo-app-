"use client";

import {
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  TriangleAlert,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/validators/auth";

/* ======================================================================
 * Remembered-email persistence
 * Inlined here (instead of importing a separate hook) so this file has
 * zero dependency on files that may not exist yet in your project.
 * Swap this out for your real `@/hooks/use-remembered-email` any time —
 * just delete this block and restore the import above.
 * ==================================================================== */

const REMEMBERED_EMAIL_KEY = "auth:remembered-email";

function useRememberedEmail() {
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (stored) setRememberedEmail(stored);
    } catch {
      // localStorage unavailable (e.g. privacy mode) — fail silently.
    }
  }, []);

  const persistEmail = useCallback((email: string, remember: boolean) => {
    try {
      if (remember) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch {
      // localStorage unavailable — fail silently.
    }
  }, []);

  return { rememberedEmail, persistEmail };
}

/* ======================================================================
 * Local UI primitives
 * Kept in this file, self-contained, so the auth/validation logic below
 * never has to move or change. Pure presentation only.
 * ==================================================================== */

type FloatingInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ReactNode;
  error?: string;
  hint?: ReactNode;
  rightSlot?: ReactNode;
};

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, icon, error, hint, rightSlot, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="w-full">
        <div
          className={[
            "group relative flex items-center rounded-2xl border bg-white/[0.03] transition-all duration-200 ease-out",
            "focus-within:bg-white/[0.05]",
            error
              ? "border-red-500/50 focus-within:border-red-400/70 focus-within:ring-2 focus-within:ring-red-500/20"
              : "border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-400/60 focus-within:ring-2 focus-within:ring-indigo-500/20",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className={[
              "pointer-events-none flex items-center pl-4 transition-colors duration-200",
              error
                ? "text-red-400"
                : "text-slate-500 group-focus-within:text-indigo-400",
            ].join(" ")}
          >
            {icon}
          </span>

          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={[
              "peer w-full bg-transparent px-3 pb-2.5 pt-6 text-[15px] text-slate-100 outline-none",
              "placeholder-transparent",
              "[&:-webkit-autofill]:[-webkit-text-fill-color:#f1f5f9] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]",
              className ?? "",
            ].join(" ")}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={[
              "pointer-events-none absolute left-11 top-4 origin-left text-[15px] text-slate-500 transition-all duration-200 ease-out",
              "peer-focus:top-2.5 peer-focus:text-[11px] peer-focus:font-medium peer-focus:tracking-wide peer-focus:text-indigo-400",
              "peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:tracking-wide",
              error && "peer-[:not(:placeholder-shown)]:text-red-400",
            ].join(" ")}
          >
            {label}
          </label>

          {rightSlot ? (
            <div className="flex shrink-0 items-center pr-2.5">{rightSlot}</div>
          ) : null}
        </div>

        <div className="min-h-[1.25rem] pt-1.5">
          {error ? (
            <p
              id={errorId}
              role="alert"
              className="flex items-center gap-1.5 text-xs font-medium text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : hint ? (
            <p
              id={hintId}
              className="flex items-center gap-1.5 text-xs text-amber-400/90"
            >
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

function IconToggleButton({
  pressed,
  onPressedChange,
  labelWhenPressed,
  labelWhenUnpressed,
}: {
  pressed: boolean;
  onPressedChange: (v: boolean) => void;
  labelWhenPressed: string;
  labelWhenUnpressed: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onPressedChange(!pressed)}
      aria-pressed={pressed}
      aria-label={pressed ? labelWhenPressed : labelWhenUnpressed}
      className="rounded-lg p-1.5 text-slate-500 transition-colors duration-150 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      {pressed ? (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

function PillCheckbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className="group flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-400 transition-colors duration-150 hover:text-slate-300"
    >
      <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={[
            "flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border transition-all duration-150 ease-out",
            "border-white/15 bg-white/[0.03]",
            "peer-checked:border-transparent peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-emerald-500",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0A0C12]",
          ].join(" ")}
        >
          <svg
            viewBox="0 0 12 10"
            className={[
              "h-[10px] w-[12px] fill-none stroke-white stroke-[2] transition-opacity duration-150",
              checked ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <path d="M1 5l3.5 3.5L11 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      {label}
    </label>
  );
}

function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={[
        "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-3.5",
        "bg-gradient-to-r from-indigo-500 via-indigo-500 to-emerald-500",
        "text-[15px] font-semibold text-white",
        "shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_12px_28px_-8px_rgba(79,70,229,0.55)]",
        "transition-all duration-200 ease-out",
        "hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_16px_34px_-8px_rgba(79,70,229,0.7)] hover:brightness-[1.05]",
        "active:scale-[0.98] active:brightness-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0C12]",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      {busy && <Loader2 className="relative h-4 w-4 animate-spin" aria-hidden="true" />}
      <span className="relative">{children}</span>
      {!busy && (
        <ArrowRight
          className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

/* ======================================================================
 * Page
 * ==================================================================== */

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const { rememberedEmail, persistEmail } = useRememberedEmail();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  // Restore a remembered email once it's read from localStorage on mount.
  useEffect(() => {
    if (rememberedEmail) {
      setValue("email", rememberedEmail);
      setValue("rememberMe", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rememberedEmail]);

  const rememberMe = watch("rememberMe") ?? false;

  const onSubmit = async (values: LoginInput) => {
    setLoading(true);

    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      toast.error(res.error || "Invalid email or password");
      return;
    }

    persistEmail(values.email, values.rememberMe ?? false);
    toast.success("Welcome back!");

    // Keep the button in a busy state through the route transition so the
    // UI never "un-loads" right before navigating away.
    setRedirecting(true);
    router.push(searchParams.get("callbackUrl") || "/dashboard");
    router.refresh();
  };

  const isBusy = loading || redirecting;

  const { onKeyUp: passwordOnKeyUp, ...passwordField } = register("password");
  const emailField = register("email");

  const handlePasswordKeyUp = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      setCapsLockOn(e.getModifierState?.("CapsLock") ?? false);
      passwordOnKeyUp?.(e);
    },
    [passwordOnKeyUp]
  );

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0A0C12] px-4 py-12 sm:px-6">
      {/* Layer 1: subtle grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#94A3B8_1px,transparent_1px),linear-gradient(90deg,#94A3B8_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]"
      />
      {/* Layer 2: radial lighting from top */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(79,70,229,0.18),transparent)]"
      />
      {/* Layer 3: soft color blobs */}
      <div
        aria-hidden="true"
        className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-indigo-600/20 blur-[100px] motion-safe:animate-[float_9s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-emerald-500/15 blur-[100px] motion-safe:animate-[float_11s_ease-in-out_infinite_-3s]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]"
      />

      <div className="relative w-full max-w-[420px] motion-safe:animate-[fadeSlideUp_0.6s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-500 to-emerald-500 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_12px_28px_-8px_rgba(79,70,229,0.55)] ring-1 ring-white/10">
            <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
          </div>

          <h1 className="text-[1.75rem] font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
            Sign in to continue to your workspace.
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] tracking-wide text-slate-400 backdrop-blur-sm">
            <Lock className="h-3 w-3 text-emerald-400" aria-hidden="true" />
            256-bit encrypted connection
          </div>
        </div>

        {/* Glass card */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-7 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_32px_64px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-8">
          {/* Signature scan-line sweep, plays once on mount */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-indigo-400/20 to-transparent motion-safe:[animation:scanLine_1.4s_ease-out_0.15s_1]"
          />
          {/* Faint border glow, always on, gives the card presence against the dark page */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[0_0_0_1px_rgba(99,102,241,0.08)]"
          />

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="relative space-y-5"
          >
            <FloatingInput
              label="Email address"
              type="email"
              autoComplete="email"
              autoFocus
              icon={<Mail className="h-4 w-4" aria-hidden="true" />}
              error={errors.email?.message}
              {...emailField}
            />

            <FloatingInput
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              icon={<Lock className="h-4 w-4" aria-hidden="true" />}
              error={errors.password?.message}
              hint={
                !errors.password && capsLockOn ? (
                  <>
                    <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Caps Lock is on
                  </>
                ) : undefined
              }
              rightSlot={
                <IconToggleButton
                  pressed={showPassword}
                  onPressedChange={setShowPassword}
                  labelWhenPressed="Hide password"
                  labelWhenUnpressed="Show password"
                />
              }
              onKeyUp={handlePasswordKeyUp}
              {...passwordField}
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <PillCheckbox
                id="remember-me"
                checked={rememberMe}
                onChange={(v) => setValue("rememberMe", v)}
                label="Remember me"
              />
              <Link
                href="/forgot-password"
                className="rounded-md text-sm font-medium text-indigo-400 transition-colors duration-150 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Forgot password?
              </Link>
            </div>

            <SubmitButton busy={isBusy}>
              {isBusy ? (redirecting ? "Redirecting…" : "Signing in…") : "Sign in"}
            </SubmitButton>
          </form>

          {/* Footer inside the card: sign-up path */}
          <div className="relative mt-6 flex items-center gap-3">
            <span aria-hidden="true" className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
            <span aria-hidden="true" className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <p className="relative mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-slate-100 underline decoration-indigo-400/50 decoration-2 underline-offset-4 transition-colors duration-150 hover:text-indigo-300 hover:decoration-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Page footer */}
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Protected by enterprise-grade encryption
          </p>
          <p className="text-xs text-slate-600">
            By continuing you agree to our{" "}
            <Link
              href="/terms"
              className="text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Privacy Policy
            </Link>
            . Need help?{" "}
            <Link
              href="/support"
              className="text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLine {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(40px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-16px) translateX(8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}