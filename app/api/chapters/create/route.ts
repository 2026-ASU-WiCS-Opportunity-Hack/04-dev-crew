import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { GeneratedChapterContent, ProfileRecord } from "@/lib/types";

interface CreateChapterRequestBody {
  name?: string;
  slug?: string;
  country?: string;
  language?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  externalWebsite?: string | null;
  content?: GeneratedChapterContent | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateChapterRequestBody;

    if (!body.name || !body.slug || !body.country) {
      return NextResponse.json(
        { ok: false, error: "name, slug, and country are required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: "You must be logged in to create a chapter." },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { ok: false, error: "Unable to load your profile." },
        { status: 403 },
      );
    }

    const role = (profile as Pick<ProfileRecord, "role">).role;
    if (!["super_admin", "chapter_lead"].includes(role)) {
      return NextResponse.json(
        { ok: false, error: "You do not have permission to create chapters." },
        { status: 403 },
      );
    }

    const admin = createSupabaseAdminClient();
    const { data: existing } = await admin
      .from("chapters")
      .select("id")
      .eq("slug", body.slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "A chapter with this path already exists." },
        { status: 409 },
      );
    }

    const { data: chapter, error: insertError } = await admin
      .from("chapters")
      .insert({
        name: body.name,
        slug: body.slug,
        country: body.country,
        language: body.language || "en",
        contact_name: body.contactName || null,
        contact_email: body.contactEmail || null,
        external_website: body.externalWebsite || null,
        content_json: body.content || null,
        is_active: true,
      })
      .select("id, slug")
      .single();

    if (insertError || !chapter) {
      return NextResponse.json(
        {
          ok: false,
          error: insertError?.message || "Failed to create chapter.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: chapter,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to create chapter.",
      },
      { status: 500 },
    );
  }
}
