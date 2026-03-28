import { NextResponse } from "next/server";

import { capturePayPalOrder } from "@/lib/paypal/client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string };

    if (!body.orderId) {
      return NextResponse.json(
        { ok: false, error: "orderId is required." },
        { status: 400 },
      );
    }

    const capture = await capturePayPalOrder(body.orderId);
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("paypal_order_id", body.orderId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      data: capture,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to capture PayPal order.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
