import { NextResponse } from "next/server";
import { Resend } from "resend";

import { getOptionalResendKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function createResendClient() {
  const apiKey = getOptionalResendKey();

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      campaignId?: string;
      recipients?: string[];
      from?: string;
    };

    if (!body.campaignId || !body.recipients?.length || !body.from) {
      return NextResponse.json(
        {
          ok: false,
          error: "campaignId, recipients, and from are required.",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", body.campaignId)
      .single();

    if (error || !campaign) {
      throw error ?? new Error("Campaign not found.");
    }

    const resend = createResendClient();
    const sendResult = await resend.emails.send({
      from: body.from,
      to: body.recipients,
      subject: campaign.subject,
      html: campaign.body_html,
    });

    const { error: updateError } = await supabase
      .from("campaigns")
      .update({
        status: "sent",
        recipient_count: body.recipients.length,
        sent_at: new Date().toISOString(),
      })
      .eq("id", body.campaignId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      ok: true,
      data: {
        campaignId: body.campaignId,
        sendResult,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to send campaign.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
