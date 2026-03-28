import { NextResponse } from "next/server";

import { generateCampaignContent } from "@/lib/ai/generate-campaign";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      chapterId?: string | null;
      createdBy?: string | null;
      subject?: string;
      templateType?: string;
      intent?: string;
      audienceDescription?: string;
      segmentFilter?: Record<string, unknown>;
    };

    if (!body.subject || !body.templateType || !body.intent) {
      return NextResponse.json(
        {
          ok: false,
          error: "subject, templateType, and intent are required.",
        },
        { status: 400 },
      );
    }

    const generated = await generateCampaignContent({
      subject: body.subject,
      intent: body.intent,
      templateType: body.templateType,
      audienceDescription: body.audienceDescription,
    });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        chapter_id: body.chapterId ?? null,
        subject: generated.subject,
        body_html: generated.bodyHtml,
        template_type: body.templateType,
        segment_filter: body.segmentFilter ?? null,
        created_by: body.createdBy ?? null,
        status: "draft",
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create campaign draft.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
