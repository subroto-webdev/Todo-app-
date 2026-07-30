"use client";

import { forwardRef, useEffect, useRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, showCharCount, maxLength, value, id, onInput, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const resize = () => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(resize, [value]);

    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          value={value}
          maxLength={maxLength}
          onInput={(e) => {
            resize();
            onInput?.(e);
          }}
          rows={3}
          className={cn(
            "w-full resize-none rounded-xl border bg-white/60 dark:bg-slate-900/60 px-4 py-3 text-sm outline-none transition-all duration-200",
            "focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10",
            error ? "border-rose-400" : "border-slate-200 dark:border-slate-700",
            className
          )}
          {...props}
        />
        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className={cn("text-xs", error ? "text-rose-500" : "text-slate-400")}>
            {error || helperText || ""}
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
Textarea.displayName = "Textarea";
