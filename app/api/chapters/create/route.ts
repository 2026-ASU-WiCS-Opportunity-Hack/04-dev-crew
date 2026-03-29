import { NextResponse } from "next/server";
import { Resend } from "resend";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOptionalResendKey } from "@/lib/env";
import type { GeneratedChapterContent, ProfileRecord } from "@/lib/types";

interface CreateChapterRequestBody {
  name?: string;
  slug?: string;
  country?: string;
  language?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  password?: string;
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

    if (!body.contactEmail || !body.password) {
      return NextResponse.json(
        { ok: false, error: "contactEmail and password are required to create the chapter lead account." },
        { status: 400 },
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 8 characters." },
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

    const admin = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await admin
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

    // Check slug not already taken
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

    // ── 1. Create the chapter ──────────────────────────────────────────────────
    const { data: chapter, error: insertError } = await admin
      .from("chapters")
      .insert({
        name: body.name,
        slug: body.slug,
        country: body.country,
        language: body.language || "en",
        contact_name: body.contactName || null,
        contact_email: body.contactEmail || null,
        content_json: body.content || null,
        is_active: true,
      })
      .select("id, slug")
      .single();

    if (insertError || !chapter) {
      return NextResponse.json(
        { ok: false, error: insertError?.message || "Failed to create chapter." },
        { status: 500 },
      );
    }

    // ── 2. Create Supabase Auth user for the chapter lead ─────────────────────
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: body.contactEmail,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.contactName || body.contactEmail,
      },
    });

    if (authError || !authUser.user) {
      // Rollback chapter creation
      await admin.from("chapters").delete().eq("id", chapter.id);
      return NextResponse.json(
        { ok: false, error: `Failed to create login account: ${authError?.message}` },
        { status: 500 },
      );
    }

    // ── 3. Insert profile with chapter_lead role ───────────────────────────────
    const { error: profileInsertError } = await admin.from("profiles").upsert({
      id: authUser.user.id,
      email: body.contactEmail,
      full_name: body.contactName || null,
      role: "chapter_lead",
      chapter_id: chapter.id,
    }, { onConflict: "id" });

    if (profileInsertError) {
      // Rollback both
      await admin.auth.admin.deleteUser(authUser.user.id);
      await admin.from("chapters").delete().eq("id", chapter.id);
      return NextResponse.json(
        { ok: false, error: `Failed to create profile: ${profileInsertError.message}` },
        { status: 500 },
      );
    }

    // ── 4. Send welcome email with credentials ────────────────────────────────
    try {
      const resendKey = getOptionalResendKey();
      if (resendKey) {
        const resend = new Resend(resendKey);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

        await resend.emails.send({
          from: "WIAL Platform <onboarding@resend.dev>",
          to: body.contactEmail,
          subject: `Your WIAL Chapter Lead account is ready — ${body.name}`,
          html: `
            <div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6;max-width:560px;margin:0 auto;padding:32px;">
              <h2 style="margin-bottom:0.5rem;">Welcome to WIAL, ${body.contactName || "Chapter Lead"}!</h2>
              <p>Your chapter lead account for <strong>${body.name}</strong> has been created by the WIAL Global admin team.</p>

              <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin:24px 0;">
                <p style="margin:0 0 8px;font-size:0.85rem;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your Login Credentials</p>
                <p style="margin:0 0 6px;"><strong>Email:</strong> ${body.contactEmail}</p>
                <p style="margin:0 0 6px;"><strong>Password:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${body.password}</code></p>
                <p style="margin:12px 0 0;font-size:0.82rem;color:#dc2626;font-weight:600;">⚠️ This is a one-time password. Please change it after your first login.</p>
              </div>

              <p>Log in to access your chapter dashboard and start managing your chapter:</p>
              <a href="${siteUrl}/login"
                 style="display:inline-block;margin-top:8px;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                Log In to Dashboard
              </a>

              <p style="margin-top:24px;font-size:0.85rem;color:#6b7280;">
                From your dashboard you can manage coaches, events, payments, job listings, and your chapter page.
              </p>
              <p style="color:#6b7280;font-size:0.85rem;">WIAL Platform &bull; wial.org</p>
            </div>
          `,
        });
      }
    } catch {
      // Non-critical — account was created, just email failed
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
