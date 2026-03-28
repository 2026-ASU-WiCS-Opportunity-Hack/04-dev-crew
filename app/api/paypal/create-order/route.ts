import { NextResponse } from "next/server";

import { createPayPalOrder } from "@/lib/paypal/client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculatePaymentAmount } from "@/lib/stripe/client";
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

    const amountCents = calculatePaymentAmount(
      body.paymentType,
      body.studentCount,
    );
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const order = (await createPayPalOrder({
      amount: amountCents,
      currency: "usd",
      returnUrl: `${siteUrl}/dashboard/chapter/payments?paypal=success`,
      cancelUrl: `${siteUrl}/dashboard/chapter/payments?paypal=canceled`,
    })) as {
      id: string;
      links?: Array<{ rel: string; href: string }>;
    };

    const supabase = createSupabaseAdminClient();
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
        payment_method: "paypal",
        paypal_order_id: order.id,
        status: "pending",
        due_date: body.dueDate ?? null,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    const approvalUrl =
      order.links?.find((link) => link.rel === "approve")?.href ?? null;

    return NextResponse.json({
      ok: true,
      data: {
        paymentId: data.id,
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
