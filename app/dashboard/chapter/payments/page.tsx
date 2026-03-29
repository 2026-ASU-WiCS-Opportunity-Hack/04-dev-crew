"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PaymentTracker } from "@/components/payments/PaymentTracker";
import { PaymentForm } from "@/components/payments/PaymentForm";
import type { PaymentRecord } from "@/lib/types";

export default function ChapterPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("chapter_id")
      .eq("id", user.id)
      .single();

    const cid = (profile as { chapter_id: string | null } | null)?.chapter_id ?? null;
    setChapterId(cid);

    if (cid) {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("chapter_id", cid)
        .order("created_at", { ascending: false });
      setPayments((data as PaymentRecord[]) ?? []);
    }
    setLoading(false);
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <h1 className="section-title">Payments</h1>
      <PaymentTracker payments={payments} />

      <section>
        <h2 className="section-title" style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>New Payment</h2>
        <PaymentForm chapterId={chapterId} showPaypal />
      </section>
    </div>
  );
}
