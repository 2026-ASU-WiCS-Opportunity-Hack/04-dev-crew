import { NextResponse } from "next/server";

import { generateChapterContent } from "@/lib/ai/generate-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ChapterGenerationInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChapterGenerationInput;

    if (!body.chapterName || !body.country || !body.language) {
      return NextResponse.json(
        { ok: false, error: "chapterName, country, and language are required." },
        { status: 400 },
      );
    }

    const content = await generateChapterContent(body);
    const slug = body.chapterName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const supabase = createSupabaseAdminClient();
    const { data: existing } = await supabase
      .from("chapters")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      data: {
        slug,
        existingChapterId: existing?.id ?? null,
        content,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to generate chapter content.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
