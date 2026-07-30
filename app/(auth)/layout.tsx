import { CheckSquare, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 font-semibold text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-emerald-600 text-white shadow-sm">
              <CheckSquare className="h-5 w-5" />
            </span>
            TaskFlow
          </div>
          {children}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-600 lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative z-10 max-w-md text-white">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Organize your work. Reclaim your focus.
          </h2>
          <p className="mt-4 text-primary-100">
            TaskFlow brings your tasks, deadlines, and progress into one beautifully designed workspace.
          </p>
          <div className="mt-10 space-y-5">
            {[
              { icon: Sparkles, text: "Smart Kanban boards and calendar views" },
              { icon: TrendingUp, text: "Real-time analytics on your productivity" },
              { icon: ShieldCheck, text: "Enterprise-grade security, always" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <f.icon className="h-4.5 w-4.5" />
                </span>
                <p className="text-sm text-primary-50">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
