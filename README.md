# Feed My Brain — website & student platform

*Empowering Tomorrow's Tech Trailblazers Today*

> **New here? Start with [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).** It covers setup, going live, daily admin use, backups and troubleshooting step by step.

Public website + student login + admin grading, built on a **free stack**:
Next.js 16 · Tailwind CSS 4 · Supabase (Postgres + Auth) · hosted on Netlify (free tier allows commercial sites).

## What's inside

| Area | Routes |
|---|---|
| Public site | `/` · `/courses` · `/courses/[slug]` · `/compare` (+ quiz) · `/how-it-works` · `/showcase` · `/mentors` · `/pricing` · `/colleges` · `/blog` · `/faq` · `/about` · `/contact` · `/legal/terms` · `/legal/privacy` · `/legal/refund` |
| Student | `/login` · `/dashboard` (projects, submit link, status, marks) · `/dashboard/password` |
| Admin | `/admin` (overview) · `/admin/batches` (create batches; per batch: add/remove students, review, gradebook) · `/admin/submissions` (open link → enter marks, filter by batch) · `/admin/students` (all students, reset password, delete) · `/admin/courses` (prices, next batch, max marks) · `/admin/enquiries` |

**Where content lives**

- Course syllabi → `content/courses/*.json` (generated from the syllabus PDFs; the PDFs are intentionally **not** published)
- Blog posts → `content/blog/*.md` (add a `.md` file with the same frontmatter to publish)
- Legal pages → `content/legal/*.md`
- Contact details, mentor, FAQs, nav → `src/lib/site.ts`
- Prices, batch dates, enrollment open/closed, project max marks → **admin dashboard** (stored in Supabase)

## One-time setup (≈15 minutes)

### 1. Create a free Supabase project
1. Sign up at [supabase.com](https://supabase.com) → **New project** (region: Mumbai / `ap-south-1`).
2. **SQL Editor → New query**: paste all of `supabase/schema.sql` → **Run**.
3. New query again: paste all of `supabase/seed.sql` → **Run** (adds the 3 courses and 56 projects).
4. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up" (only admins create student logins).
5. **Project Settings → API Keys**: copy the project URL, the **publishable** key and the **secret** key.

### 2. Configure and run locally
```bash
cp .env.example .env.local      # then paste the values from step 1.5
npm install
npm run create-admin -- feedmybrain211@gmail.com "a-strong-password" "Darshan"
npm run dev                     # http://localhost:3000
```
Log in at `/login` with the admin account → you land on `/admin`.

### 3. Deploy for free (Netlify)
1. Push this folder to a GitHub repo.
2. [netlify.com](https://netlify.com) → **Add new site → Import from Git** → pick the repo (Next.js is detected automatically).
3. **Site settings → Environment variables**: add the four variables from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to your real domain).
4. Deploy. Add your custom domain under **Domain management** (the domain itself is the only paid item).
5. In Supabase **Authentication → URL Configuration**, set the Site URL to your domain.

> Supabase free projects pause after 7 days with no activity. A live site with visitors keeps it awake; if it pauses before launch, click **Restore** in the dashboard.

## Day-to-day admin workflow

1. **New batch starting** → `/admin/batches` → **New batch** (course, name, dates, status).
2. **New student paid** → open the batch → **Add students to this batch** → fill name, email, phone → **Create** → click **Send on WhatsApp** to share the login. Already has a login from another course? Use **Existing student** instead.
3. **Wrong batch / dropped out** → on the batch's Students tab use **Move to batch…** or **Remove from batch** (keeps their login and past work). **Delete student** removes the login and all their submissions permanently.
4. **Student submits** a GitHub link from their dashboard → it appears in `/admin/submissions` and in the batch's **Review** tab under *Awaiting evaluation*. The batch's **Gradebook** tab shows every student × project at a glance.
5. **Open the link**, review, enter marks (+ optional remark) → **Save marks** → the student sees marks on their dashboard immediately.
4. Need a redo? **Clear marks and allow resubmission** unlocks the link for the student.
7. **Change a fee or batch date** → `/admin/courses` → Save → the public site updates immediately.
8. **Forgot password** → `/admin/students` → **Reset password** → share the new one on WhatsApp.

## Upgrading an existing database

`supabase/schema.sql` is safe to re-run. After pulling schema changes (e.g. batches), paste it into the Supabase SQL editor and **Run** again **before** deploying the new code. Existing enrollments show up under *Students → Not in a batch* until you assign them.

## Security model

All rules are enforced **in the database** (Row Level Security + triggers in `supabase/schema.sql`), not just in the UI:

- Students can only read their own enrollments, submissions and marks.
- Students can only submit to projects of courses they're enrolled in, and **can never set marks or status**. The trigger strips them.
- Once evaluated, a submission is locked for the student.
- Students can't change their own role. Only admins can grade, edit prices, manage enrollments or read enquiries.
- The public can read courses/prices and send enquiries, nothing else.
- `SUPABASE_SECRET_KEY` is used only on the server, for creating logins and resetting passwords.

## Updating the syllabus

Edit `content/courses/<slug>.json`, then:
```bash
npm run seed:generate   # rewrites supabase/seed.sql
```
Run the new `seed.sql` in the Supabase SQL editor. It updates project titles and briefs but keeps admin-edited prices and max marks.
