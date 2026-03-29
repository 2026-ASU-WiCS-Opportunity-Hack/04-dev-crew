import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";

type RevalidateBody = {
  chapterId?: string;
  chapterSlug?: string;
};

const ALLOWED_ROLES: AppRole[] = ["super_admin", "chapter_lead", "content_creator"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RevalidateBody;

    if (!body.chapterId || !body.chapterSlug) {
      return NextResponse.json(
        { ok: false, error: "chapterId and chapterSlug are required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const admin = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role, chapter_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || !ALLOWED_ROLES.includes(profile.role as AppRole)) {
      return NextResponse.json(
        { ok: false, error: "Forbidden." },
        { status: 403 },
      );
    }

    if (profile.role !== "super_admin" && profile.chapter_id !== body.chapterId) {
      return NextResponse.json(
        { ok: false, error: "You can only revalidate your assigned chapter." },
        { status: 403 },
      );
    }

    revalidatePath(`/${body.chapterSlug}`);
    revalidatePath(`/${body.chapterSlug}/coaches`);
    revalidatePath(`/${body.chapterSlug}/events`);
    revalidatePath("/events");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to revalidate chapter pages.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
