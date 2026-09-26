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
| Admin | `/admin` (overview) · `/admin/submissions` (open link → enter marks) · `/admin/students` (create login, enroll, reset password) · `/admin/courses` (prices, next batch, max marks) · `/admin/enquiries` |

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

1. **New student paid** → `/admin/students` → fill name, email, phone, course → **Create student** → click **Send on WhatsApp** to share the login.
2. **Student submits** a GitHub link from their dashboard → it appears in `/admin/submissions` under *Awaiting evaluation*.
3. **Open the link**, review, enter marks (+ optional remark) → **Save marks** → the student sees marks on their dashboard immediately.
4. Need a redo? **Clear marks and allow resubmission** unlocks the link for the student.
5. **Change a fee or batch date** → `/admin/courses` → Save → the public site updates immediately.
6. **Forgot password** → `/admin/students` → **Reset password** → share the new one on WhatsApp.

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
