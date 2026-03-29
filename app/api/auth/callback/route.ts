import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  APP_SESSION_COOKIE_NAME,
  APP_SESSION_INACTIVITY_TIMEOUT_MINUTES,
  getDashboardPathForRole,
  hashSessionToken,
} from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRecord } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", url.origin));
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Pick<ProfileRecord, "role"> | null;

  const destination =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : profile?.role
        ? getDashboardPathForRole(profile.role)
        : "/dashboard/coach";

  if (!profile?.role) {
    return NextResponse.redirect(new URL(destination, url.origin));
  }

  // Create the app session so middleware allows access to the dashboard
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  await admin
    .from("app_user_sessions")
    .update({ revoked_at: now, revocation_reason: "replaced_by_new_login" })
    .eq("user_id", user.id)
    .is("revoked_at", null);

  const sessionToken = randomUUID();
  const sessionTokenHash = await hashSessionToken(sessionToken);

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");

  const { error: sessionError } = await admin.from("app_user_sessions").insert({
    user_id: user.id,
    role: profile.role,
    session_token_hash: sessionTokenHash,
    user_agent: userAgent,
    ip_address: ipAddress,
    last_active_at: now,
  });

  if (sessionError) {
    return NextResponse.redirect(new URL("/login?error=session_create", url.origin));
  }

  const redirectResponse = NextResponse.redirect(new URL(destination, url.origin));
  redirectResponse.cookies.set({
    name: APP_SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: APP_SESSION_INACTIVITY_TIMEOUT_MINUTES * 60,
  });

  return redirectResponse;
}
