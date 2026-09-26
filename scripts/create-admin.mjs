// Creates (or promotes) the first admin account.
// Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> "<Full name>"

import { createClient } from "@supabase/supabase-js";

const [email, password, fullName = "Admin"] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> "<Full name>"');
  process.exit(1);
}
if (!url || !secret) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.");
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { persistSession: false } });

let userId;
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
});

if (error) {
  if (!/already/i.test(error.message)) {
    console.error("Could not create user:", error.message);
    process.exit(1);
  }
  const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).single();
  if (!existing) {
    console.error("User exists in auth but has no profile row. Run schema.sql first.");
    process.exit(1);
  }
  userId = existing.id;
  console.log("User already exists — promoting to admin.");
} else {
  userId = data.user.id;
}

const { error: roleError } = await supabase.from("profiles").update({ role: "admin", full_name: fullName }).eq("id", userId);
if (roleError) {
  console.error("Could not set admin role:", roleError.message);
  process.exit(1);
}
console.log(`Admin ready: ${email}`);
