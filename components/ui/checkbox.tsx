"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
}

export function Checkbox({ checked, onChange, className, label }: CheckboxProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2 select-none", className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "btn-focus flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150",
          checked
            ? "border-primary-600 bg-primary-600 scale-100"
            : "border-slate-300 dark:border-slate-600 bg-transparent hover:border-primary-400"
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white animate-scale-in" strokeWidth={3} />}
      </button>
      {label && (
        <span className={cn("text-sm transition-colors", checked && "text-slate-400 line-through")}>
          {label}
        </span>
      )}
    </label>
  );
}
