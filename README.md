# TaskFlow — Smart Task & Productivity Manager

A premium, production-grade task management app built with **Next.js 15 (App Router)**, **TypeScript**, **MongoDB/Mongoose**, and **NextAuth**.

---

## ✅ What's implemented (real, working code)

- **Auth**: Register, login, logout, forgot/reset password, protected routes via middleware, JWT sessions, bcrypt password hashing
- **Profile**: Update name, change password, delete account (cascades task deletion)
- **Tasks**: Full CRUD, duplicate, pin, favorite, archive/restore, soft delete with undo toast, bulk complete/archive/delete
- **Subtasks & checklist**: Nested, with progress bars
- **Views**: List (with search/filter/sort), Kanban board (drag & drop via `@dnd-kit`), Calendar (month grid + agenda)
- **Dashboard**: Overview stat cards, recent activity, upcoming deadlines — computed server-side directly from MongoDB
- **Analytics**: Completion trend (30-day), priority distribution, category breakdown — via MongoDB aggregation + Recharts
- **Command palette**: `⌘K` / `Ctrl+K` quick navigation and quick task creation
- **UI system**: Glassmorphism, dark/light/system theme (next-themes), floating-label inputs, animated modals/dropdowns, skeleton loading, empty states, toast notifications (Sonner)
- **Security**: Password hashing, input validation (Zod) on every API route, ownership checks on every task query, basic in-memory rate limiting on auth routes

## ⚠️ Scaffolded but not fully wired (see comments in code)

These are mentioned in the original spec but need real third-party services to function — the hooks/structure are in place, but you'll need to plug in providers:

- **Email sending** (verification emails, password reset emails) — the tokens are generated and stored; wire up Resend/SendGrid/Nodemailer in `app/api/auth/register` and `app/api/auth/forgot-password`
- **File/attachment uploads** — the `Task.attachments` schema exists; wire up S3/Cloudinary/UploadThing for actual file storage
- **PWA offline support** — `manifest.json` is included; a service worker (e.g. via `next-pwa`) still needs to be added for real offline caching
- **CSV/Excel/PDF export & import** — not included; straightforward to add with `papaparse` / `xlsx` / a PDF lib against the existing `/api/tasks` data
- **Streaks/achievements/focus score** — gamification layer not built; would read off `Task.completedAt` history

Everything else in the spec (design system, task model, filters, bulk actions, kanban, calendar, analytics, dark mode, command palette, responsive layout, accessibility basics, validation, security headers) is real, working code — not stubs.

---

## Getting started

### 1. Prerequisites
- Node.js 18.18+ 
- A MongoDB database (free tier on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) works great)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env.local` and fill in the values:
```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart-todo
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=   # generate with: openssl rand -base64 32
JWT_SECRET=        # generate with: openssl rand -base64 32
```

### 4. (Optional) Seed demo data
```bash
npm run seed
```
This creates a demo account: `demo@taskflow.app` / `Demo1234` with sample tasks across categories.

### 5. Run the dev server
```bash
npm run dev
```
Visit `http://localhost:3000` — you'll be redirected to `/login`. Register a new account or use the seeded demo account.

### 6. Build for production
```bash
npm run build
npm start
```

---

## Project structure

```
app/
  (auth)/            # login, register, forgot/reset password — split-screen layout
  (dashboard)/        # dashboard, tasks, kanban, calendar, analytics, settings — sidebar layout
  api/                 # all backend route handlers
components/
  ui/                  # reusable primitives: Button, Input, Modal, Dropdown, Badge, Card…
  layout/              # Sidebar, Navbar, Command Palette
  tasks/               # TaskCard, TaskForm, TaskList, KanbanBoard, CalendarView
  dashboard/           # OverviewCards, AnalyticsCharts, DashboardClient, SettingsClient
lib/                   # db connection, NextAuth config, utils
models/                # Mongoose schemas: User, Task, Category
services/              # typed fetch wrappers for the frontend
store/                 # Zustand stores (tasks, UI state)
hooks/                 # useTasks, useDebounce
validators/            # Zod schemas for auth & tasks
types/                 # shared TypeScript types
middleware.ts          # route protection
```

## Notes on architecture decisions

- **Server Components first**: Dashboard stats are computed directly against MongoDB in a server component — no API round-trip needed on first load.
- **Client Components** are used only where interactivity is required (forms, drag-and-drop, modals, charts).
- **Zustand** holds only UI/session-local state (task list cache, filters, modal open state) — the source of truth is always MongoDB via the API layer.
- **Ownership is enforced on every query** — every task/category lookup is scoped to `{ userId: session.user.id }`, so users can never read or mutate each other's data even if they guess an ID.
# Todo-app-
