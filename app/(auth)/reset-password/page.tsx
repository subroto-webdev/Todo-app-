"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPasswordSchema, type ResetPasswordInput } from "@/validators/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success("Password reset! Please sign in.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-bold">Invalid or missing reset link</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please request a new password reset link.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Choose a strong password you haven&apos;t used before.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <input type="hidden" {...register("token")} />
        <Input
          label="New password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          label="Confirm new password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" variant="gradient" className="w-full" size="lg" loading={loading}>
          Reset password
        </Button>
      </form>

      <Link href="/login" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </Link>
    </div>
  );
}
