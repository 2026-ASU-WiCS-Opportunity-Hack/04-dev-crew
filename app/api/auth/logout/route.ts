import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  APP_SESSION_COOKIE_NAME,
  hashSessionToken,
} from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appSessionToken = cookies().get(APP_SESSION_COOKIE_NAME)?.value;

  if (user && appSessionToken) {
    const sessionTokenHash = await hashSessionToken(appSessionToken);

    await createSupabaseAdminClient()
      .from("app_user_sessions")
      .update({
        revoked_at: new Date().toISOString(),
        revocation_reason: "logout",
      })
      .eq("user_id", user.id)
      .eq("session_token_hash", sessionTokenHash)
      .is("revoked_at", null);
  }

  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: APP_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
