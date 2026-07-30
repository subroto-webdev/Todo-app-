"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
  showCharCount?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, success, icon, helperText, showCharCount, type, maxLength, value, id, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;
    const hasValue = value !== undefined && value !== "";

    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            value={value}
            maxLength={maxLength}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            placeholder={label ? " " : props.placeholder}
            className={cn(
              "peer h-12 w-full rounded-xl border bg-white/60 dark:bg-slate-900/60 px-4 text-sm outline-none transition-all duration-200 placeholder-transparent",
              "focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10",
              icon && "pl-11",
              (isPassword || error || success) && "pr-11",
              error
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                : success
                ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10"
                : "border-slate-200 dark:border-slate-700",
              className
            )}
            {...props}
          />

          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 origin-left text-sm text-slate-400 transition-all duration-200",
                icon && "left-11",
                (focused || hasValue) &&
                  "-top-2 left-3 scale-90 bg-background px-1.5 text-primary-600 dark:text-primary-400",
                error && (focused || hasValue) && "text-rose-500"
              )}
            >
              {label}
            </label>
          )}

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {!isPassword && error && (
            <AlertCircle className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-500" />
          )}
          {!isPassword && success && !error && (
            <CheckCircle2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1">
          <p
            className={cn(
              "text-xs transition-all duration-150",
              error
                ? "translate-y-0 text-rose-500 opacity-100"
                : helperText
                ? "text-slate-400"
                : "h-0 opacity-0"
            )}
          >
            {error || helperText}
          </p>
          {showCharCount && maxLength && (
            <p className="text-xs text-slate-400 tabular-nums">
              {String(value ?? "").length}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";
