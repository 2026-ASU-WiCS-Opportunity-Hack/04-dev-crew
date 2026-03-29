import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOptionalResendKey } from "@/lib/env";
import { Resend } from "resend";
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
      .select("id, slug")
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
    revalidatePath(`/${chapter.slug}/coaches`);
    revalidatePath(`/${chapter.slug}/events`);
    revalidatePath("/events");

    // Notify admin when chapter lead or content creator publishes changes
    try {
      const resendKey = getOptionalResendKey();
      if (resendKey) {
        const { data: branding } = await admin
          .from("global_branding_settings")
          .select("executive_director_email, site_name")
          .eq("id", "global")
          .maybeSingle();

        const adminEmail = branding?.executive_director_email;
        if (adminEmail) {
          const resend = new Resend(resendKey);
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
          const updatedBy = profile.role === "content_creator" ? "Content Creator" : "Chapter Lead";
          await resend.emails.send({
            from: "WIAL Platform <onboarding@resend.dev>",
            to: adminEmail,
            subject: `Chapter page updated — ${body.name ?? chapter.slug}`,
            html: `
              <div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6;max-width:560px;margin:0 auto;padding:32px;">
                <h2 style="margin-bottom:0.5rem;">Chapter Page Updated</h2>
                <p>The <strong>${body.name ?? chapter.slug}</strong> chapter page was just updated by a <strong>${updatedBy}</strong>.</p>
                <a href="${siteUrl}/${chapter.slug}"
                   style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                  View Chapter Page
                </a>
                <p style="margin-top:24px;color:#6b7280;font-size:0.85rem;">${branding?.site_name ?? "WIAL Platform"}</p>
              </div>
            `,
          });
        }
      }
    } catch {
      // Non-critical — don't fail the update if email fails
    }

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
