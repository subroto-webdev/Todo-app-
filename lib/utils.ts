import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Standard success API response shape. */
export function apiSuccess<T>(data: T, message = "Success", status = 200) {
  return Response.json({ success: true, message, data }, { status });
}

/** Standard error API response shape. */
export function apiError(message = "Something went wrong", status = 400, errors?: unknown) {
  return Response.json({ success: false, message, errors }, { status });
}

/** Slugify a string, e.g. for category slugs. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Debounce a value change - paired with the useDebounce hook. */
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Simple in-memory rate limiter (per-process). For production use Upstash/Redis. */
const rateLimitMap = new Map<string, { count: number; expires: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.expires < now) {
    rateLimitMap.set(key, { count: 1, expires: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}
