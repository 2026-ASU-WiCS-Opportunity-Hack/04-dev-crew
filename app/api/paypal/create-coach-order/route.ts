import { NextResponse } from "next/server";

import { createPayPalOrder } from "@/lib/paypal/client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type MembershipType = "membership" | "renewal" | "certification";

const MEMBERSHIP_AMOUNTS: Record<MembershipType, number> = {
  membership: 10000,    // $100.00
  renewal: 7500,        // $75.00
  certification: 5000,  // $50.00
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

    const amountCents = MEMBERSHIP_AMOUNTS[membershipType];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const order = (await createPayPalOrder({
      amount: amountCents,
      currency: "usd",
      returnUrl: `${siteUrl}/dashboard/coach/membership?paypal=success`,
      cancelUrl: `${siteUrl}/dashboard/coach/membership?paypal=canceled`,
    })) as { id: string; links?: Array<{ rel: string; href: string }> };

    // Log the payment record (requires 0006_coach_payments migration)
    const supabase = createSupabaseAdminClient();
    await supabase.from("coach_payments").insert({
      coach_id: coachId,
      payer_name: payerName,
      payer_email: payerEmail,
      membership_type: membershipType,
      amount_cents: amountCents,
      currency: "usd",
      payment_method: "paypal",
      paypal_order_id: order.id,
      status: "pending",
    });

    const approvalUrl = order.links?.find((l) => l.rel === "approve")?.href ?? null;

    return NextResponse.json({
      ok: true,
      data: {
        orderId: order.id,
        approvalUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create PayPal order.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
