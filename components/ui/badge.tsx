import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        primary: "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400",
        success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        danger: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
        warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
        info: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
        outline: "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
