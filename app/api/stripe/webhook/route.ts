import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getStripeEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";
import { sendPaymentConfirmationEmail, sendChapterPaymentReceiptEmail, sendAdminChapterPaymentAlertEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const body = await request.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { ok: false, error: "Missing Stripe signature." },
        { status: 400 },
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeEnv().webhookSecret,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata ?? {};
      const supabase = createSupabaseAdminClient();
      const now = new Date().toISOString();
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;

      if (metadata.coachId && metadata.membershipType) {
        // Coach membership payment — update coach_payments + extend certification_expiry
        await supabase
          .from("coach_payments")
          .update({ status: "paid", paid_at: now })
          .eq("stripe_checkout_session_id", session.id);

        // Extend certification_expiry by 2 years
        const { data: coach } = await supabase
          .from("coaches")
          .select("certification_expiry")
          .eq("id", metadata.coachId)
          .maybeSingle();

        const baseDate =
          coach?.certification_expiry && new Date(coach.certification_expiry) > new Date()
            ? new Date(coach.certification_expiry)
            : new Date();

        baseDate.setFullYear(baseDate.getFullYear() + 2);

        const newExpiry = baseDate.toISOString().slice(0, 10);

        await supabase
          .from("coaches")
          .update({ certification_expiry: newExpiry })
          .eq("id", metadata.coachId);

        console.log("[webhook] Coach membership updated:", {
          coachId: metadata.coachId,
          membershipType: metadata.membershipType,
          newExpiry,
        });

        // Send payment confirmation email
        const { data: coachForEmail } = await supabase
          .from("coaches")
          .select("full_name, contact_email")
          .eq("id", metadata.coachId)
          .maybeSingle();

        if (coachForEmail?.contact_email) {
          const amountCents = typeof session.amount_total === "number" ? session.amount_total : 0;
          await sendPaymentConfirmationEmail({
            to: coachForEmail.contact_email,
            name: coachForEmail.full_name,
            membershipType: metadata.membershipType,
            amountCents,
            newExpiry,
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
          }).catch((err) => console.error("[webhook] Failed to send payment email:", err));
        }
      } else if (metadata.chapterId) {
        // Chapter dues payment — update payments table
        await supabase
          .from("payments")
          .update({ status: "paid", paid_at: now, stripe_payment_intent_id: paymentIntentId })
          .eq("stripe_checkout_session_id", session.id);

        console.log("[webhook] Chapter payment updated:", { chapterId: metadata.chapterId, sessionId: session.id });

        // Fetch chapter + payment details for emails
        const { data: chapterPayment } = await supabase
          .from("payments")
          .select("payer_name, payer_email, chapters(name)")
          .eq("stripe_checkout_session_id", session.id)
          .maybeSingle();

        const chapterName = (chapterPayment?.chapters as { name?: string } | null)?.name ?? "Your Chapter";
        const amountCents = typeof session.amount_total === "number" ? session.amount_total : 0;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

        // Receipt to chapter lead
        if (chapterPayment?.payer_email) {
          await sendChapterPaymentReceiptEmail({
            to: chapterPayment.payer_email,
            name: chapterPayment.payer_name ?? chapterPayment.payer_email,
            chapterName,
            amountCents,
            siteUrl,
          }).catch((err) => console.error("[webhook] Failed to send chapter receipt email:", err));
        }

        // Alert to admin
        const { data: branding } = await supabase
          .from("global_branding_settings")
          .select("executive_director_email")
          .eq("id", "global")
          .maybeSingle();

        const adminEmail = (branding as { executive_director_email?: string } | null)?.executive_director_email ?? "info@wial.org";

        await sendAdminChapterPaymentAlertEmail({
          to: adminEmail,
          chapterName,
          payerName: chapterPayment?.payer_name ?? null,
          payerEmail: chapterPayment?.payer_email ?? null,
          amountCents,
          siteUrl,
        }).catch((err) => console.error("[webhook] Failed to send admin alert email:", err));
      }
    }

    return NextResponse.json({ ok: true, data: { received: true } });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to process Stripe webhook.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 400 },
    );
  }
}
