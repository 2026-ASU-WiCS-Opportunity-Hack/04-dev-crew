import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  APP_SESSION_COOKIE_NAME,
  APP_SESSION_INACTIVITY_TIMEOUT_MINUTES,
  hashSessionToken,
} from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRecord } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Please sign in again." },
      { status: 401 },
    );
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileData as ProfileRecord | null) ?? null;

  if (!profile) {
    return NextResponse.json(
      {
        ok: false,
        error: "Your account is missing an assigned role.",
      },
      { status: 403 },
    );
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  await admin
    .from("app_user_sessions")
    .update({
      revoked_at: now,
      revocation_reason: "replaced_by_new_login",
    })
    .eq("user_id", user.id)
    .is("revoked_at", null);

  const sessionToken = randomUUID();
  const sessionTokenHash = await hashSessionToken(sessionToken);

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");

  const { error } = await admin.from("app_user_sessions").insert({
    user_id: user.id,
    role: profile.role,
    session_token_hash: sessionTokenHash,
    user_agent: userAgent,
    ip_address: ipAddress,
    last_active_at: now,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Unable to start your session." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    role: profile.role,
  });

  response.cookies.set({
    name: APP_SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: APP_SESSION_INACTIVITY_TIMEOUT_MINUTES * 60,
  });

  return response;
}
