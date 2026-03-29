import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";

type MembershipType = "membership" | "renewal" | "certification";

const MEMBERSHIP_AMOUNTS: Record<MembershipType, number> = {
  membership: 10000,    // $100.00
  renewal: 7500,        // $75.00
  certification: 5000,  // $50.00
};

const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  membership: "WIAL New Membership",
  renewal: "WIAL Membership Renewal",
  certification: "WIAL Certification Fee",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      coachId: string;
      payerName: string;
      payerEmail: string;
      membershipType: MembershipType;
    };

    const { coachId, payerName, payerEmail, membershipType } = body;

    if (!coachId || !payerName || !payerEmail || !membershipType) {
      return NextResponse.json(
        { ok: false, error: "coachId, payerName, payerEmail, and membershipType are required." },
        { status: 400 },
      );
    }

    if (!MEMBERSHIP_AMOUNTS[membershipType]) {
      return NextResponse.json(
        { ok: false, error: "Invalid membership type." },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();
    const amountCents = MEMBERSHIP_AMOUNTS[membershipType];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${siteUrl}/dashboard/coach/membership?success=1`,
      cancel_url: `${siteUrl}/dashboard/coach/membership?canceled=1`,
      customer_email: payerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: { name: MEMBERSHIP_LABELS[membershipType] },
          },
        },
      ],
      metadata: { coachId, payerEmail, payerName, membershipType },
    });

    // Log the payment record (requires 0006_coach_payments migration)
    const supabase = createSupabaseAdminClient();
    await supabase.from("coach_payments").insert({
      coach_id: coachId,
      payer_name: payerName,
      payer_email: payerEmail,
      membership_type: membershipType,
      amount_cents: amountCents,
      currency: "usd",
      payment_method: "stripe",
      stripe_checkout_session_id: session.id,
      status: "pending",
    });

    return NextResponse.json({
      ok: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    console.error("[create-coach-checkout] Stripe error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create checkout session.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
