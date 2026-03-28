import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculatePaymentAmount, getStripeClient } from "@/lib/stripe/client";
import type { CheckoutRequestBody } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;

    if (
      !body.chapterId ||
      !body.payerName ||
      !body.payerEmail ||
      !body.paymentType ||
      !body.studentCount
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "chapterId, payerName, payerEmail, paymentType, and studentCount are required.",
        },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();
    const supabase = createSupabaseAdminClient();
    const amountCents = calculatePaymentAmount(
      body.paymentType,
      body.studentCount,
    );
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${siteUrl}/dashboard/chapter/payments?success=1`,
      cancel_url: `${siteUrl}/dashboard/chapter/payments?canceled=1`,
      customer_email: body.payerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name:
                body.paymentType === "enrollment"
                  ? "WIAL enrollment dues"
                  : "WIAL certification dues",
            },
          },
        },
      ],
      metadata: {
        chapterId: body.chapterId,
        payerEmail: body.payerEmail,
        payerName: body.payerName,
        paymentType: body.paymentType,
        studentCount: String(body.studentCount),
      },
    });

    const { data, error } = await supabase
      .from("payments")
      .insert({
        chapter_id: body.chapterId,
        payer_name: body.payerName,
        payer_email: body.payerEmail,
        payment_type: body.paymentType,
        student_count: body.studentCount,
        amount_cents: amountCents,
        currency: "usd",
        stripe_checkout_session_id: session.id,
        payment_method: "stripe",
        status: "pending",
        due_date: body.dueDate ?? null,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      data: {
        paymentId: data.id,
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create Stripe checkout session.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
