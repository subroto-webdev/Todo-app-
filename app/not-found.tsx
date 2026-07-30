import Link from "next/link";
import { CompassIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
        <CompassIcon className="h-7 w-7" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="max-w-sm text-muted-foreground">
        We couldn&apos;t find the page you&apos;re looking for. It may have been moved or deleted.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
