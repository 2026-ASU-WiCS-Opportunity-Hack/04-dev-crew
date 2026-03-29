import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { profile } = await requireAuth({ allowedRoles: ["super_admin"] });

    if (profile.role !== "super_admin") {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const { paymentId } = (await request.json()) as { paymentId: string };

    if (!paymentId) {
      return NextResponse.json({ ok: false, error: "paymentId is required." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("payments")
      .update({ status: "overdue" })
      .eq("id", paymentId)
      .eq("status", "pending");

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to mark payment as overdue.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
