"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema, type LoginInput } from "@/validators/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (values: LoginInput) => {
    setLoading(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error(res.error || "Invalid email or password");
      return;
    }

    toast.success("Welcome back!");
    router.push(searchParams.get("callbackUrl") || "/dashboard");
    router.refresh();
  };

  return (
    <div className="animate-slide-up">
      {/* Icon badge */}
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-600 text-white shadow-lg shadow-primary-500/20 ring-4 ring-primary-500/10">
        <ShieldCheck className="h-5.5 w-5.5" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        Welcome back
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to continue to your workspace.
      </p>

      {/* Card wrapper */}
      <div className="mt-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_12px_32px_-12px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            icon={<Lock className="h-4 w-4" />}
            {...register("password")}
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              checked={watch("rememberMe") ?? false}
              onChange={(v) => setValue("rememberMe", v)}
              label="Remember me"
            />
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="gradient" className="w-full group" size="lg" loading={loading}>
            {!loading && (
              <>
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
            {loading && "Signing in…"}
          </Button>
        </form>
      </div>

      {/* Divider */}
      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        <span className="text-xs font-medium text-slate-400">New here?</span>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      </div>

      <Link
        href="/register"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-700 dark:hover:border-primary-700 dark:hover:bg-primary-500/5 dark:hover:text-primary-400"
      >
        Create a free account
      </Link>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Your data is encrypted and never shared
      </p>
    </div>
  );
}