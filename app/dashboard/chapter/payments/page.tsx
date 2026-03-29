"use client";

import { useEffect, useState } from "react";

import { PaymentTracker } from "@/components/payments/PaymentTracker";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CoachRecord, PaymentRecord } from "@/lib/types";

type HeadcountRow = {
  level: string;
  label: string;
  count: number;
  ratePerCoach: number;
};

function buildHeadcount(coaches: CoachRecord[]): HeadcountRow[] {
  const counts: Record<string, number> = { CALC: 0, PALC: 0, SALC: 0, MALC: 0 };
  for (const c of coaches) {
    if (c.certification_level in counts) counts[c.certification_level]++;
  }
  return [
    { level: "CALC", label: "CALC (Assessment Coach)", count: counts.CALC, ratePerCoach: 5000 },
    { level: "PALC", label: "PALC (Professional Coach)", count: counts.PALC, ratePerCoach: 3000 },
    { level: "SALC", label: "SALC (Senior Coach)", count: counts.SALC, ratePerCoach: 3000 },
    { level: "MALC", label: "MALC (Master Coach)", count: counts.MALC, ratePerCoach: 3000 },
  ];
}

export default function ChapterPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayForm, setShowPayForm] = useState(false);
  const { chapterId } = useChapterDashboardContext();

  useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      return;
    }
    loadData(chapterId);
  }, [chapterId]);

  async function loadData(currentChapterId: string) {
    const supabase = createSupabaseBrowserClient();

    const [{ data: paymentsData }, { data: coachesData }] = await Promise.all([
      supabase
        .from("payments")
        .select("*")
        .eq("chapter_id", currentChapterId)
        .order("created_at", { ascending: false }),
      supabase
        .from("coaches")
        .select("id, certification_level")
        .eq("chapter_id", currentChapterId)
        .eq("is_approved", true),
    ]);

    setPayments((paymentsData as PaymentRecord[]) ?? []);
    setCoaches((coachesData as CoachRecord[]) ?? []);
    setLoading(false);
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

  const headcount = buildHeadcount(coaches);
  const totalOwedCents = headcount.reduce((sum, row) => sum + row.count * row.ratePerCoach, 0);
  const totalOwed = `$${(totalOwedCents / 100).toFixed(2)}`;
  const totalCoaches = coaches.length;

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <h1 className="section-title">Payments</h1>

      {/* UC4 Headcount Summary */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">WIAL Global Dues Summary</h2>
          <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{totalCoaches} active coaches</span>
        </div>
        <div className="dash-card__body" style={{ padding: 0 }}>
          <table className="data-table" style={{ marginTop: 0 }}>
            <thead>
              <tr>
                <th>Certification Level</th>
                <th style={{ textAlign: "center" }}>Coaches</th>
                <th style={{ textAlign: "right" }}>Rate / Coach</th>
                <th style={{ textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {headcount.map((row) => (
                <tr key={row.level}>
                  <td style={{ fontWeight: 600 }}>{row.label}</td>
                  <td style={{ textAlign: "center" }}>{row.count}</td>
                  <td style={{ textAlign: "right", color: "var(--muted)", fontSize: "0.88rem" }}>
                    ${(row.ratePerCoach / 100).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    ${((row.count * row.ratePerCoach) / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--border)" }}>
                <td colSpan={3} style={{ fontWeight: 800, fontSize: "0.95rem", padding: "0.75rem 1rem" }}>
                  Total Owed to WIAL Global
                </td>
                <td style={{ textAlign: "right", fontWeight: 800, fontSize: "1.05rem", color: "var(--brand)", padding: "0.75rem 1rem" }}>
                  {totalOwed} USD
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)" }}>
              CALC: $50/coach · PALC / SALC / MALC: $30/coach · Approved coaches only
            </p>
            <button
              type="button"
              className="button-primary"
              onClick={() => setShowPayForm(true)}
              style={{ flexShrink: 0 }}
            >
              Pay WIAL Global
            </button>
          </div>
        </div>
      </div>

      {/* Inline payment form */}
      {showPayForm && (
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 className="section-title" style={{ fontSize: "1.15rem", margin: 0 }}>New Payment to WIAL Global</h2>
            <button type="button" className="button-secondary" style={{ fontSize: "0.82rem" }} onClick={() => setShowPayForm(false)}>
              Cancel
            </button>
          </div>
          <PaymentForm chapterId={chapterId} showPaypal />
        </section>
      )}

      <PaymentTracker payments={payments} />

      {!showPayForm && (
        <section>
          <h2 className="section-title" style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>New Payment</h2>
          <PaymentForm chapterId={chapterId} showPaypal />
        </section>
      )}
    </div>
  );
}
