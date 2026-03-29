import { NextResponse } from "next/server";
import { Resend } from "resend";

import {
  DEFAULT_GLOBAL_BRANDING,
  normalizeBrandingSettings,
} from "@/lib/branding";
import { getOptionalResendKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { GlobalBrandingSettings } from "@/lib/types";

type BrandingUpdateBody = Partial<
  Pick<
    GlobalBrandingSettings,
    | "template_id"
    | "logo_url"
    | "site_name"
    | "header_cta_label"
    | "primary_nav_json"
    | "footer_summary"
    | "executive_director_email"
    | "brand_color"
    | "brand_dark_color"
    | "accent_color"
    | "footer_background"
  >
> & {
  notificationMessage?: string;
};

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("global_branding_settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();

    if (error) {
      return NextResponse.json({
        ok: true,
        data: DEFAULT_GLOBAL_BRANDING,
      });
    }

    return NextResponse.json({
      ok: true,
      data: normalizeBrandingSettings(data as Partial<GlobalBrandingSettings> | null),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load branding settings.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
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
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== "super_admin") {
      return NextResponse.json(
        { ok: false, error: "Only super admins can update branding." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as BrandingUpdateBody;

    const { data: current } = await admin
      .from("global_branding_settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();

    const nextTemplateVersion =
      ((current as GlobalBrandingSettings | null)?.template_version ?? 0) + 1;

    const nextSettings = normalizeBrandingSettings({
      ...(current as Partial<GlobalBrandingSettings> | null),
      ...body,
      id: "global",
      template_version: nextTemplateVersion,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    });

    const { data: saved, error: saveError } = await admin
      .from("global_branding_settings")
      .upsert(nextSettings, { onConflict: "id" })
      .select("*")
      .single();

    if (saveError) {
      throw saveError;
    }

    const { data: chapterLeads, error: leadsError } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("role", "chapter_lead")
      .not("email", "is", null);

    if (leadsError) {
      throw leadsError;
    }

    const recipients = (chapterLeads ?? [])
      .map((lead) => lead.email)
      .filter((email): email is string => Boolean(email));

    const resendKey = getOptionalResendKey();
    let emailDelivery: "sent" | "simulated" | "skipped" = "skipped";

    if (recipients.length > 0) {
      if (resendKey) {
        const resend = new Resend(resendKey);
        const subject = `${saved.site_name} template updated (v${saved.template_version})`;
        const message =
          body.notificationMessage?.trim() ||
          "Global branding was updated. Your chapter content is unchanged, and the new shared template is now live across all chapter pages.";

        await resend.emails.send({
          from: "WIAL Global <onboarding@resend.dev>",
          to: recipients,
          subject,
          html: `
            <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
              <h2 style="margin-bottom: 0.5rem;">Shared branding updated</h2>
              <p>${message}</p>
              <p><strong>Site name:</strong> ${saved.site_name}</p>
              <p><strong>Header CTA:</strong> ${saved.header_cta_label}</p>
              <p><strong>Template version:</strong> ${saved.template_version}</p>
              <p>Your chapter-specific content remains unchanged.</p>
            </div>
          `,
        });
        emailDelivery = "sent";
      } else {
        emailDelivery = "simulated";
      }
    }

    return NextResponse.json({
      ok: true,
      data: normalizeBrandingSettings(saved as GlobalBrandingSettings),
      notification: {
        recipients: recipients.length,
        delivery: emailDelivery,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to update branding settings.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
