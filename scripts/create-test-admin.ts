/**
 * Create a test admin user for local development.
 * Usage: npx tsx scripts/create-test-admin.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/* ── load .env.local ─────────────────────────── */
function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const contents = readFileSync(envPath, "utf8");
  for (const raw of contents.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}
loadLocalEnv();

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TEST_EMAIL = "admin@wial.test";
const TEST_PASSWORD = "admin123456";

async function main() {
  const supabase = createSupabaseAdminClient();

  /* 1. Create or fetch auth user */
  console.log(`\n🔑  Creating test user: ${TEST_EMAIL} / ${TEST_PASSWORD}\n`);

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  let userId: string | null = null;

  const existing = existingUsers?.users?.find((u) => u.email === TEST_EMAIL);
  if (existing) {
    console.log("   ✅ Auth user already exists:", existing.id);
    userId = existing.id;
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (createErr) {
      console.error("   ❌ Failed to create auth user:", createErr.message);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log("   ✅ Auth user created:", userId);
  }

  /* 2. Look up a chapter to assign */
  const { data: chapters } = await supabase.from("chapters").select("id, name").limit(1);
  const chapterId = chapters?.[0]?.id ?? null;
  if (chapterId) {
    console.log(`   📍 Will assign chapter: ${chapters![0].name} (${chapterId})`);
  }

  /* 3. Upsert profile with super_admin role */
  const { error: profileErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: TEST_EMAIL,
      full_name: "WIAL Admin",
      role: "super_admin",
      chapter_id: chapterId,
    },
    { onConflict: "id" }
  );

  if (profileErr) {
    console.error("   ❌ Failed to upsert profile:", profileErr.message);
    process.exit(1);
  }
  console.log("   ✅ Profile set to super_admin");

  console.log("\n──────────────────────────────────────────");
  console.log("  Login credentials:");
  console.log(`    Email:    ${TEST_EMAIL}`);
  console.log(`    Password: ${TEST_PASSWORD}`);
  console.log("──────────────────────────────────────────\n");
}

main().catch(console.error);
