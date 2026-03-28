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
      const supabase = createSupabaseAdminClient();

      await supabase
        .from("payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
        })
        .eq("stripe_checkout_session_id", session.id);
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
