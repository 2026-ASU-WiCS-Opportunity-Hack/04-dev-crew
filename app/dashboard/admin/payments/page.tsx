"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { centsToCurrency } from "@/lib/utils";
import { RevenueChart } from "@/components/payments/RevenueChart";
import type { ChapterRecord, CoachRecord, PaymentRecord } from "@/lib/types";

interface CoachWithExpiry {
  certification_expiry: string | null;
}

function PaymentBadge({ status }: { status: string }) {
  const bg: Record<string, string> = { paid: "#dcfce7", pending: "#fef9c3", overdue: "#fee2e2", failed: "#fee2e2" };
  const fg: Record<string, string> = { paid: "#15803d", pending: "#a16207", overdue: "#dc2626", failed: "#dc2626" };
  return (
    <span className="badge" style={{ background: bg[status] ?? "var(--surface-muted)", color: fg[status] ?? "var(--muted)" }}>
      {status}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const [chapters, setChapters] = useState<ChapterRecord[]>([]);
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [markingOverdue, setMarkingOverdue] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    async function load() {
      const [chaptersRes, coachesRes, paymentsRes] = await Promise.all([
        supabase.from("chapters").select("*").order("name"),
        supabase.from("coaches").select("*").order("full_name"),
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
      ]);
      setChapters((chaptersRes.data as ChapterRecord[]) ?? []);
      setCoaches((coachesRes.data as CoachRecord[]) ?? []);
      setPayments((paymentsRes.data as PaymentRecord[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount_cents, 0);
  const totalPaid = payments.filter((p) => p.status === "paid").length;
  const conversionRate = payments.length > 0 ? Math.round((totalPaid / payments.length) * 100) : 0;

  const chapterRevenueData = chapters.map((ch) => {
    const chPayments = payments.filter((p) => p.chapter_id === ch.id);
    return {
      chapterName: ch.name,
      totalCents: chPayments.reduce((s, p) => s + p.amount_cents, 0),
      paidCents: chPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0),
      pendingCents: chPayments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount_cents, 0),
      overdueCount: chPayments.filter((p) => p.status === "overdue").length,
    };
  });

  function buildReportRows() {
    return chapters.map((ch) => {
      const chCoaches = coaches.filter((c) => c.chapter_id === ch.id);
      const chPayments = payments.filter((p) => p.chapter_id === ch.id);
      const paid = chPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);
      const pending = chPayments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount_cents, 0);
      const certBreakdown = (["CALC", "PALC", "SALC", "MALC"] as const).map(
        (lvl) => chCoaches.filter((c) => c.certification_level === lvl).length
      );
      return { name: ch.name, country: ch.country, totalCoaches: chCoaches.length, approved: chCoaches.filter((c) => c.is_approved).length, calc: certBreakdown[0], palc: certBreakdown[1], salc: certBreakdown[2], malc: certBreakdown[3], revenuePaid: paid, revenuePending: pending, payments: chPayments.length };
    });
  }

  function exportCsv() {
    const rows = buildReportRows();
    const header = "Chapter,Country,Total Coaches,Approved,CALC,PALC,SALC,MALC,Revenue Paid,Revenue Pending,Payments";
    const csv = [header, ...rows.map((r) => [r.name, r.country, r.totalCoaches, r.approved, r.calc, r.palc, r.salc, r.malc, centsToCurrency(r.revenuePaid), centsToCurrency(r.revenuePending), r.payments].join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wial-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function markAsOverdue(paymentId: string) {
    setMarkingOverdue(paymentId);
    try {
      await fetch("/api/admin/payments/mark-overdue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, status: "overdue" } : p)));
    } finally {
      setMarkingOverdue(null);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;

  const reportRows = showReport ? buildReportRows() : [];

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="section-title" style={{ margin: 0 }}>Payments & Analytics</h1>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setShowReport(!showReport)} className="button-secondary">
            {showReport ? "Hide Report" : "Generate Report"}
          </button>
          <button type="button" onClick={exportCsv} className="button-secondary">
            Export CSV
          </button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="hero-stats">
        <div className="stat-card"><strong>{payments.length}</strong><span>Total Payments</span></div>
        <div className="stat-card"><strong>{centsToCurrency(totalRevenue)}</strong><span>Total Revenue</span></div>
        <div className="stat-card">
          <strong style={{ color: conversionRate >= 90 ? "#15803d" : conversionRate >= 70 ? "#a16207" : "#dc2626" }}>
            {conversionRate}%
          </strong>
          <span>Conversion Rate</span>
        </div>
        <div className="stat-card"><strong>{payments.filter((p) => p.status === "overdue").length}</strong><span>Overdue</span></div>
        <div className="stat-card"><strong>{payments.filter((p) => p.status === "pending").length}</strong><span>Pending</span></div>
      </div>

      {/* Revenue by Chapter */}
      <section>
        <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Revenue by Chapter</h3>
        <div className="contact-card" style={{ padding: "1.5rem", marginTop: "0.75rem" }}>
          <RevenueChart data={chapterRevenueData} />
        </div>
      </section>

      {/* Platform Analytics */}
      <section>
        <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Platform Analytics</h3>
        <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", marginTop: "0.75rem" }}>

          {/* Certification Level Breakdown */}
          <div className="contact-card" style={{ padding: "1.5rem" }}>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Certification Levels</p>
            {(["CALC", "PALC", "SALC", "MALC"] as const).map((lvl) => {
              const count = coaches.filter((c) => c.certification_level === lvl).length;
              const pct = coaches.length > 0 ? Math.round((count / coaches.length) * 100) : 0;
              const colors: Record<string, string> = { CALC: "#1a56db", PALC: "#7c3aed", SALC: "#059669", MALC: "#d97706" };
              return (
                <div key={lvl} style={{ marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600 }}>{lvl}</span>
                    <span style={{ color: "var(--muted)" }}>{count} coach{count !== 1 ? "es" : ""} &bull; {pct}%</span>
                  </div>
                  <div style={{ height: "8px", background: "var(--surface-muted)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: colors[lvl], borderRadius: "4px" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coaches per Chapter */}
          <div className="contact-card" style={{ padding: "1.5rem" }}>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Coaches per Chapter</p>
            {chapters
              .map((ch) => ({ name: ch.name, count: coaches.filter((c) => c.chapter_id === ch.id).length }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map(({ name, count }) => {
                const maxCount = Math.max(...chapters.map((ch) => coaches.filter((c) => c.chapter_id === ch.id).length), 1);
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={name} style={{ marginBottom: "0.85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{name}</span>
                      <span style={{ color: "var(--muted)" }}>{count}</span>
                    </div>
                    <div style={{ height: "8px", background: "var(--surface-muted)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#1a56db", borderRadius: "4px" }} />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Coach Status */}
          <div className="contact-card" style={{ padding: "1.5rem" }}>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Coach Status</p>
            {(() => {
              const approved = coaches.filter((c) => c.is_approved).length;
              const pending = coaches.length - approved;
              const approvedPct = coaches.length > 0 ? Math.round((approved / coaches.length) * 100) : 0;
              const pendingPct = coaches.length > 0 ? 100 - approvedPct : 0;
              const expiringSoon = coaches.filter((c) => {
                const expiry = (c as unknown as CoachWithExpiry).certification_expiry;
                if (!expiry) return false;
                const days = Math.round((new Date(expiry).getTime() - Date.now()) / 86400000);
                return days > 0 && days <= 90;
              }).length;
              return (
                <>
                  <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ textAlign: "center" }}><p style={{ fontSize: "2rem", fontWeight: 700, color: "#15803d", lineHeight: 1 }}>{approved}</p><p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>Approved</p></div>
                    <div style={{ textAlign: "center" }}><p style={{ fontSize: "2rem", fontWeight: 700, color: "#a16207", lineHeight: 1 }}>{pending}</p><p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>Pending</p></div>
                    <div style={{ textAlign: "center" }}><p style={{ fontSize: "2rem", fontWeight: 700, color: "#1a56db", lineHeight: 1 }}>{coaches.length}</p><p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>Total</p></div>
                  </div>
                  <div style={{ height: "16px", background: "var(--surface-muted)", borderRadius: "8px", overflow: "hidden", display: "flex" }}>
                    <div style={{ height: "100%", width: `${approvedPct}%`, background: "#15803d" }} />
                    <div style={{ height: "100%", width: `${pendingPct}%`, background: "#a16207" }} />
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--muted)" }}>
                    <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", background: "#15803d", marginRight: "4px" }} />{approvedPct}% approved</span>
                    <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", background: "#a16207", marginRight: "4px" }} />{pendingPct}% pending</span>
                  </div>
                  {expiringSoon > 0 && (
                    <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "#fef9c3", borderRadius: "8px", fontSize: "0.85rem", color: "#a16207" }}>
                      <strong>{expiringSoon}</strong> coach{expiringSoon !== 1 ? "es" : ""} with certification expiring within 90 days
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Organization Report */}
      {showReport && (
        <section>
          <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Organization Report</h3>
          <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto", marginTop: "0.75rem" }}>
            <table style={{ width: "100%", textAlign: "left", fontSize: "0.85rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Chapter", "Country", "Coaches", "Approved", "CALC", "PALC", "SALC", "MALC", "Revenue (Paid)", "Revenue (Pending)", "Payments"].map((h) => (
                    <th key={h} style={{ padding: "0.5rem", fontSize: "0.7rem", textTransform: "uppercase", color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportRows.map((r) => (
                  <tr key={r.name} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.5rem", fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: "0.5rem" }}>{r.country}</td>
                    <td style={{ padding: "0.5rem" }}>{r.totalCoaches}</td>
                    <td style={{ padding: "0.5rem" }}>{r.approved}</td>
                    <td style={{ padding: "0.5rem" }}>{r.calc}</td>
                    <td style={{ padding: "0.5rem" }}>{r.palc}</td>
                    <td style={{ padding: "0.5rem" }}>{r.salc}</td>
                    <td style={{ padding: "0.5rem" }}>{r.malc}</td>
                    <td style={{ padding: "0.5rem", color: "#15803d" }}>{centsToCurrency(r.revenuePaid)}</td>
                    <td style={{ padding: "0.5rem", color: "#a16207" }}>{centsToCurrency(r.revenuePending)}</td>
                    <td style={{ padding: "0.5rem" }}>{r.payments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent Payments */}
      <section>
        <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Recent Payments</h3>
        <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto", marginTop: "0.75rem" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Payer", "Chapter", "Type", "Amount", "Status", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 20).map((p) => {
                const chapterName = chapters.find((ch) => ch.id === p.chapter_id)?.name ?? "—";
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.5rem 0.75rem" }}>{p.payer_name}</td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted)", fontSize: "0.85rem" }}>{chapterName}</td>
                    <td style={{ padding: "0.5rem 0.75rem", textTransform: "capitalize" }}>{p.payment_type}</td>
                    <td style={{ padding: "0.5rem 0.75rem" }}>{centsToCurrency(p.amount_cents)}</td>
                    <td style={{ padding: "0.5rem 0.75rem" }}><PaymentBadge status={p.status} /></td>
                    <td style={{ padding: "0.5rem 0.75rem" }}>
                      {p.status === "pending" && (
                        <button type="button" onClick={() => markAsOverdue(p.id)} disabled={markingOverdue === p.id}
                          style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", cursor: "pointer", opacity: markingOverdue === p.id ? 0.5 : 1 }}
                          className="button-secondary">
                          {markingOverdue === p.id ? "..." : "Mark Overdue"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
