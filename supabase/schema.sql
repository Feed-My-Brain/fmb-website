-- Feed My Brain — database schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Then run seed.sql (courses + projects).

-- ───────────────────────────── Tables ─────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text not null default '',
  phone       text,
  college     text,
  role        text not null default 'student' check (role in ('student', 'admin')),
  created_at  timestamptz not null default now()
);

create table if not exists public.courses (
  id                text primary key,                -- slug, e.g. 'agentic-ai'
  title             text not null,
  price_inr         integer not null check (price_inr >= 0),
  next_batch        text,                            -- free text shown on the site, e.g. 'Starts 15 Nov 2026'
  enrollment_open   boolean not null default true,
  sort              integer not null default 0,
  updated_at        timestamptz not null default now()
);

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  course_id   text not null references public.courses (id) on delete cascade,
  week        integer,                               -- null for the capstone
  title       text not null,
  brief       text not null default '',
  max_marks   integer not null default 10 check (max_marks > 0),
  sort        integer not null default 0,
  unique (course_id, sort)
);

create table if not exists public.enrollments (
  student_id   uuid not null references public.profiles (id) on delete cascade,
  course_id    text not null references public.courses (id) on delete cascade,
  enrolled_at  timestamptz not null default now(),
  primary key (student_id, course_id)
);

create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles (id) on delete cascade,
  project_id    uuid not null references public.projects (id) on delete cascade,
  link          text not null check (link ~* '^https?://'),
  status        text not null default 'submitted' check (status in ('submitted', 'evaluated')),
  marks         numeric(6, 2),
  remark        text,
  submitted_at  timestamptz not null default now(),
  evaluated_at  timestamptz,
  evaluated_by  uuid references public.profiles (id),
  unique (student_id, project_id)
);

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'contact' check (kind in ('contact', 'enquiry', 'college')),
  name        text not null check (char_length(name) between 1 and 120),
  email       text check (email is null or char_length(email) <= 200),
  phone       text check (phone is null or char_length(phone) <= 30),
  college     text check (college is null or char_length(college) <= 200),
  course      text check (course is null or char_length(course) <= 60),
  message     text check (message is null or char_length(message) <= 2000),
  status      text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at  timestamptz not null default now()
);

create index if not exists submissions_status_idx on public.submissions (status, submitted_at desc);
create index if not exists projects_course_idx on public.projects (course_id, sort);
create index if not exists leads_created_idx on public.leads (created_at desc);

-- ───────────────────────────── Helpers ─────────────────────────────

-- True when the signed-in user is an admin. SECURITY DEFINER so it can read
-- profiles without tripping the profiles RLS policies (avoids recursion).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Create a profile row whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, college)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'college'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Students may only submit/edit their link. Marks, status and evaluation
-- fields can only be changed by an admin (or the service role / SQL editor,
-- where auth.uid() is null).
create or replace function public.guard_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status       := 'submitted';
    new.marks        := null;
    new.remark       := null;
    new.evaluated_at := null;
    new.evaluated_by := null;
    new.submitted_at := now();
    return new;
  end if;

  if old.status = 'evaluated' then
    raise exception 'This project has already been evaluated and can no longer be changed.';
  end if;

  new.student_id   := old.student_id;
  new.project_id   := old.project_id;
  new.status       := old.status;
  new.marks        := old.marks;
  new.remark       := old.remark;
  new.evaluated_at := old.evaluated_at;
  new.evaluated_by := old.evaluated_by;
  new.submitted_at := now();
  return new;
end;
$$;

drop trigger if exists guard_submission on public.submissions;
create trigger guard_submission
  before insert or update on public.submissions
  for each row execute function public.guard_submission();

-- Students can't promote themselves to admin.
create or replace function public.guard_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile
  before update on public.profiles
  for each row execute function public.guard_profile();

-- ───────────────────────────── Row level security ─────────────────────────────

alter table public.profiles    enable row level security;
alter table public.courses     enable row level security;
alter table public.projects    enable row level security;
alter table public.enrollments enable row level security;
alter table public.submissions enable row level security;
alter table public.leads       enable row level security;

-- profiles
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin());

-- courses: public read, admin write
drop policy if exists "courses: public read" on public.courses;
create policy "courses: public read" on public.courses
  for select to anon, authenticated using (true);
drop policy if exists "courses: admin write" on public.courses;
create policy "courses: admin write" on public.courses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- projects: public read, admin write
drop policy if exists "projects: public read" on public.projects;
create policy "projects: public read" on public.projects
  for select to anon, authenticated using (true);
drop policy if exists "projects: admin write" on public.projects;
create policy "projects: admin write" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- enrollments: students read their own, admin manages
drop policy if exists "enrollments: read own or admin" on public.enrollments;
create policy "enrollments: read own or admin" on public.enrollments
  for select to authenticated using (student_id = auth.uid() or public.is_admin());
drop policy if exists "enrollments: admin write" on public.enrollments;
create policy "enrollments: admin write" on public.enrollments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- submissions
drop policy if exists "submissions: read own or admin" on public.submissions;
create policy "submissions: read own or admin" on public.submissions
  for select to authenticated using (student_id = auth.uid() or public.is_admin());

drop policy if exists "submissions: student insert" on public.submissions;
create policy "submissions: student insert" on public.submissions
  for insert to authenticated with check (
    public.is_admin()
    or (
      student_id = auth.uid()
      and exists (
        select 1
        from public.projects p
        join public.enrollments e on e.course_id = p.course_id
        where p.id = project_id and e.student_id = auth.uid()
      )
    )
  );

drop policy if exists "submissions: update own pending or admin" on public.submissions;
create policy "submissions: update own pending or admin" on public.submissions
  for update to authenticated
  using (public.is_admin() or (student_id = auth.uid() and status = 'submitted'))
  with check (public.is_admin() or student_id = auth.uid());

drop policy if exists "submissions: admin delete" on public.submissions;
create policy "submissions: admin delete" on public.submissions
  for delete to authenticated using (public.is_admin());

-- leads: anyone can send an enquiry, only admin can read/manage
drop policy if exists "leads: anyone can insert" on public.leads;
create policy "leads: anyone can insert" on public.leads
  for insert to anon, authenticated with check (status = 'new');
drop policy if exists "leads: admin read" on public.leads;
create policy "leads: admin read" on public.leads
  for select to authenticated using (public.is_admin());
drop policy if exists "leads: admin update" on public.leads;
create policy "leads: admin update" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "leads: admin delete" on public.leads;
create policy "leads: admin delete" on public.leads
  for delete to authenticated using (public.is_admin());
