import { NextResponse } from "next/server";

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

  let destination = next ?? "/dashboard/coach";
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!next && user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const profile = profileData as Pick<ProfileRecord, "role"> | null;
    if (profile?.role === "super_admin") {
      destination = "/dashboard/admin";
    } else if (
      profile?.role === "chapter_lead" ||
      profile?.role === "content_creator"
    ) {
      destination = "/dashboard/chapter";
    }
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
