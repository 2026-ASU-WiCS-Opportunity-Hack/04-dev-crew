import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getStripeEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";

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

        await supabase
          .from("coaches")
          .update({ certification_expiry: baseDate.toISOString().slice(0, 10) })
          .eq("id", metadata.coachId);

        console.log("[webhook] Coach membership updated:", {
          coachId: metadata.coachId,
          membershipType: metadata.membershipType,
          newExpiry: baseDate.toISOString().slice(0, 10),
        });
      } else if (metadata.chapterId) {
        // Chapter dues payment — update payments table
        await supabase
          .from("payments")
          .update({ status: "paid", paid_at: now, stripe_payment_intent_id: paymentIntentId })
          .eq("stripe_checkout_session_id", session.id);

        console.log("[webhook] Chapter payment updated:", { chapterId: metadata.chapterId, sessionId: session.id });
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
