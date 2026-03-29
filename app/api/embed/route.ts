import { NextResponse } from "next/server";

import { buildCoachEmbeddingText, createEmbedding } from "@/lib/ai/embeddings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      coachId?: string;
      fullName?: string;
      certificationLevel?: string;
      locationCity?: string | null;
      locationCountry?: string | null;
      bio?: string | null;
      specializations?: string[];
    };

    if (!body.coachId) {
      return NextResponse.json(
        { ok: false, error: "coachId is required." },
        { status: 400 },
      );
    }

    const embeddingText = buildCoachEmbeddingText({
      fullName: body.fullName ?? "",
      certificationLevel: body.certificationLevel ?? "",
      locationCity: body.locationCity,
      locationCountry: body.locationCountry,
      bio: body.bio,
      specializations: body.specializations,
    });

    const embedding = await createEmbedding(embeddingText);
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("coaches")
      .update({ embedding })
      .eq("id", body.coachId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      data: { coachId: body.coachId, dimensions: embedding.length },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to generate embedding.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
