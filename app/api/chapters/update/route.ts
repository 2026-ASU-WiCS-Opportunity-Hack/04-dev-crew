import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { normalizeChapterContent } from "@/lib/chapter-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { GeneratedChapterContent } from "@/lib/types";

type ChapterUpdateBody = {
  chapterId?: string;
  name?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  externalWebsite?: string | null;
  language?: string;
  content?: GeneratedChapterContent | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChapterUpdateBody;

    if (!body.chapterId) {
      return NextResponse.json(
        { ok: false, error: "chapterId is required." },
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

    if (profileError || !profile) {
      return NextResponse.json(
        { ok: false, error: "Profile not found." },
        { status: 403 },
      );
    }

    const isSuperAdmin = profile.role === "super_admin";
    const canAccessChapter =
      isSuperAdmin || profile.chapter_id === body.chapterId;

    if (!canAccessChapter || !["super_admin", "chapter_lead", "content_creator"].includes(profile.role)) {
      return NextResponse.json(
        { ok: false, error: "Forbidden." },
        { status: 403 },
      );
    }

    const { data: chapter, error: chapterError } = await admin
      .from("chapters")
      .select("id, slug, name, country, language, contact_name, contact_email, external_website, is_active, created_at, updated_at")
      .eq("id", body.chapterId)
      .maybeSingle();

    if (chapterError || !chapter) {
      return NextResponse.json(
        { ok: false, error: "Chapter not found." },
        { status: 404 },
      );
    }

    const isContentCreator = profile.role === "content_creator";

    const updatePayload = isContentCreator
      ? {
          content_json: body.content ?? null,
        }
      : {
          name: body.name,
          contact_name: body.contactName ?? null,
          contact_email: body.contactEmail ?? null,
          external_website: body.externalWebsite ?? null,
          language: body.language,
          content_json: body.content ?? null,
        };

    const { error: updateError } = await admin
      .from("chapters")
      .update(updatePayload)
      .eq("id", body.chapterId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath(`/${chapter.slug}`);
    const normalizedContent = normalizeChapterContent({
      id: body.chapterId,
      name: body.name ?? chapter.name,
      slug: chapter.slug,
      country: chapter.country,
      language: body.language ?? chapter.language,
      contact_name: body.contactName ?? chapter.contact_name,
      contact_email: body.contactEmail ?? chapter.contact_email,
      external_website: body.externalWebsite ?? chapter.external_website,
      content_json: body.content ?? null,
      is_active: chapter.is_active,
      created_at: chapter.created_at,
      updated_at: chapter.updated_at,
    });
    normalizedContent.pages?.forEach((page) => {
      if (!page.is_home && page.slug) {
        revalidatePath(`/${chapter.slug}/${page.slug}`);
      }
    });
    revalidatePath(`/${chapter.slug}/coaches`);
    revalidatePath(`/${chapter.slug}/events`);
    revalidatePath("/events");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to update chapter.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
