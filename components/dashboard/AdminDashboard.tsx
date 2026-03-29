"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { centsToCurrency } from "@/lib/utils";
import { RevenueChart } from "@/components/payments/RevenueChart";
import type {
  ChapterRecord,
  CoachRecord,
  PaymentRecord,
} from "@/lib/types";

interface CoachWithExpiry {
  id: string;
  full_name: string;
  certification_level: string;
  certification_expiry: string | null;
  contact_email: string | null;
  location_country: string | null;
  chapter_id: string | null;
}

interface ReminderPreview {
  coachName: string;
  daysLeft: number;
  subject: string;
  body: string;
}

export function AdminDashboard() {
  const [chapters, setChapters] = useState<ChapterRecord[]>([]);
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  /* Report state */
  const [showReport, setShowReport] = useState(false);

  /* Overdue state */
  const [markingOverdue, setMarkingOverdue] = useState<string | null>(null);

  /* Recertification state */
  const [recertCoaches, setRecertCoaches] = useState<CoachWithExpiry[]>([]);
  const [recertLoading, setRecertLoading] = useState(false);
  const [reminderPreviews, setReminderPreviews] = useState<ReminderPreview[]>([]);

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

  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount_cents, 0);

  /* ── Payment conversion rate ── */
  const totalInitiated = payments.length;
  const totalPaid = payments.filter((p) => p.status === "paid").length;
  const conversionRate = totalInitiated > 0 ? Math.round((totalPaid / totalInitiated) * 100) : 0;

  /* ── Chapters with payment issues ── */
  const chaptersNoPayment = chapters.filter(
    (ch) => !payments.some((p) => p.chapter_id === ch.id),
  );
  const chaptersUnpaid = chapters.filter((ch) => {
    const chPayments = payments.filter((p) => p.chapter_id === ch.id);
    return chPayments.length > 0 && !chPayments.some((p) => p.status === "paid");
  });

  /* ── Mark payment as overdue ── */
  async function markAsOverdue(paymentId: string) {
    setMarkingOverdue(paymentId);
    try {
      await fetch("/api/admin/payments/mark-overdue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: "overdue" } : p)),
      );
    } finally {
      setMarkingOverdue(null);
    }
  }

  /* ── Revenue per chapter for chart ── */
  const chapterRevenueData = chapters.map((ch) => {
    const chPayments = payments.filter((p) => p.chapter_id === ch.id);
    const paidCents = chPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);
    const pendingCents = chPayments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount_cents, 0);
    const overdueCount = chPayments.filter((p) => p.status === "overdue").length;
    return {
      chapterName: ch.name,
      totalCents: chPayments.reduce((s, p) => s + p.amount_cents, 0),
      paidCents,
      pendingCents,
      overdueCount,
    };
  });

  /* ── Generate Report (per-chapter breakdown + CSV export) ── */
  function buildReportRows() {
    return chapters.map((ch) => {
      const chCoaches = coaches.filter((c) => c.chapter_id === ch.id);
      const chPayments = payments.filter((p) => p.chapter_id === ch.id);
      const paid = chPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);
      const pending = chPayments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount_cents, 0);
      const certBreakdown = (["CALC", "PALC", "SALC", "MALC"] as const).map(
        (lvl) => chCoaches.filter((c) => c.certification_level === lvl).length
      );
      return {
        name: ch.name,
        country: ch.country,
        totalCoaches: chCoaches.length,
        approved: chCoaches.filter((c) => c.is_approved).length,
        calc: certBreakdown[0],
        palc: certBreakdown[1],
        salc: certBreakdown[2],
        malc: certBreakdown[3],
        revenuePaid: paid,
        revenuePending: pending,
        payments: chPayments.length,
      };
    });
  }

  function exportCsv() {
    const rows = buildReportRows();
    const header = "Chapter,Country,Total Coaches,Approved,CALC,PALC,SALC,MALC,Revenue Paid,Revenue Pending,Payments";
    const csv = [
      header,
      ...rows.map((r) =>
        [r.name, r.country, r.totalCoaches, r.approved, r.calc, r.palc, r.salc, r.malc, centsToCurrency(r.revenuePaid), centsToCurrency(r.revenuePending), r.payments].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wial-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Check Recertification ── */
  const checkRecertification = useCallback(async () => {
    setRecertLoading(true);
    setReminderPreviews([]);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("coaches")
      .select("id, full_name, certification_level, certification_expiry, contact_email, location_country, chapter_id")
      .not("certification_expiry", "is", null)
      .order("certification_expiry", { ascending: true });

    const now = new Date();
    const coachesNearExpiry = ((data as CoachWithExpiry[]) ?? []).filter((c) => {
      if (!c.certification_expiry) return false;
      const daysDiff = Math.round((new Date(c.certification_expiry).getTime() - now.getTime()) / 86400000);
      return daysDiff > 0 && daysDiff <= 90;
    });
    setRecertCoaches(coachesNearExpiry);

    /* Generate AI reminder previews for up to 5 coaches */
    const previews: ReminderPreview[] = [];
    for (const coach of coachesNearExpiry.slice(0, 5)) {
      const daysLeft = Math.round((new Date(coach.certification_expiry!).getTime() - now.getTime()) / 86400000);
      const reminderCount = daysLeft <= 30 ? 3 : daysLeft <= 60 ? 2 : 1;
      try {
        const res = await fetch("/api/ai/generate-reminder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payerName: coach.full_name,
            amount: 0,
            studentCount: 0,
            paymentType: "recertification",
            reminderCount,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          const reminder = d.data ?? d;
          previews.push({
            coachName: coach.full_name,
            daysLeft,
            subject: reminder.subject ?? "Recertification Reminder",
            body: reminder.body ?? "",
          });
        }
      } catch {
        /* skip if AI call fails */
      }
    }
    setReminderPreviews(previews);
    setRecertLoading(false);
  }, []);

  if (loading) {
    return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading dashboard...</p>;
  }

  const reportRows = showReport ? buildReportRows() : [];

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      {/* Stats */}
      <div className="hero-stats">
        <div className="stat-card"><strong>{chapters.length}</strong><span>Chapters</span></div>
        <div className="stat-card"><strong>{coaches.length}</strong><span>Coaches</span></div>
        <div className="stat-card"><strong>{payments.length}</strong><span>Payments</span></div>
        <div className="stat-card"><strong>{centsToCurrency(totalRevenue)}</strong><span>Total Revenue</span></div>
        <div className="stat-card">
          <strong style={{ color: conversionRate >= 90 ? "#15803d" : conversionRate >= 70 ? "#a16207" : "#dc2626" }}>
            {conversionRate}%
          </strong>
          <span>Conversion Rate</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="stack-actions" style={{ flexWrap: "wrap" }}>
        <button type="button" onClick={() => setShowReport(!showReport)} className="button-secondary">
          {showReport ? "Hide Report" : "Generate Report"}
        </button>
        <button type="button" onClick={exportCsv} className="button-secondary">
          Export CSV
        </button>
        <button type="button" onClick={checkRecertification} disabled={recertLoading} className="button-secondary" style={{ opacity: recertLoading ? 0.5 : 1 }}>
          {recertLoading ? "Checking..." : "Check Recertification"}
        </button>
      </div>

      {/* Chapters with payment issues */}
      {(chaptersNoPayment.length > 0 || chaptersUnpaid.length > 0) && (
        <section>
          <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Chapters Requiring Attention</h3>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginTop: "0.75rem" }}>
            {chaptersNoPayment.length > 0 && (
              <div className="contact-card" style={{ padding: "1.25rem", borderLeft: "4px solid #dc2626" }}>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", color: "#dc2626", marginBottom: "0.75rem" }}>
                  No Payments Ever ({chaptersNoPayment.length})
                </p>
                {chaptersNoPayment.map((ch) => (
                  <div key={ch.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid var(--border)", fontSize: "0.9rem" }}>
                    <span style={{ fontWeight: 600 }}>{ch.name}</span>
                    <span style={{ color: "var(--muted)" }}>{ch.country}</span>
                  </div>
                ))}
              </div>
            )}
            {chaptersUnpaid.length > 0 && (
              <div className="contact-card" style={{ padding: "1.25rem", borderLeft: "4px solid #a16207" }}>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", color: "#a16207", marginBottom: "0.75rem" }}>
                  Pending / Overdue Only ({chaptersUnpaid.length})
                </p>
                {chaptersUnpaid.map((ch) => {
                  const chPayments = payments.filter((p) => p.chapter_id === ch.id);
                  const hasOverdue = chPayments.some((p) => p.status === "overdue");
                  return (
                    <div key={ch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.35rem 0", borderBottom: "1px solid var(--border)", fontSize: "0.9rem" }}>
                      <span style={{ fontWeight: 600 }}>{ch.name}</span>
                      <span className="badge" style={{ background: hasOverdue ? "#fee2e2" : "#fef9c3", color: hasOverdue ? "#dc2626" : "#a16207" }}>
                        {hasOverdue ? "overdue" : "pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Revenue Chart */}
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
            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>
              Certification Levels
            </p>
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
                    <div style={{ height: "100%", width: `${pct}%`, background: colors[lvl], borderRadius: "4px", transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coaches per Chapter */}
          <div className="contact-card" style={{ padding: "1.5rem" }}>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>
              Coaches per Chapter
            </p>
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
                      <div style={{ height: "100%", width: `${pct}%`, background: "#1a56db", borderRadius: "4px", transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Coach Status Breakdown */}
          <div className="contact-card" style={{ padding: "1.5rem" }}>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>
              Coach Status
            </p>
            {(() => {
              const approved = coaches.filter((c) => c.is_approved).length;
              const pending = coaches.length - approved;
              const approvedPct = coaches.length > 0 ? Math.round((approved / coaches.length) * 100) : 0;
              const pendingPct = coaches.length > 0 ? 100 - approvedPct : 0;
              return (
                <>
                  <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "2rem", fontWeight: 700, color: "#15803d", lineHeight: 1 }}>{approved}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>Approved</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "2rem", fontWeight: 700, color: "#a16207", lineHeight: 1 }}>{pending}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>Pending</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "2rem", fontWeight: 700, color: "#1a56db", lineHeight: 1 }}>{coaches.length}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>Total</p>
                    </div>
                  </div>
                  <div style={{ height: "16px", background: "var(--surface-muted)", borderRadius: "8px", overflow: "hidden", display: "flex" }}>
                    <div style={{ height: "100%", width: `${approvedPct}%`, background: "#15803d", transition: "width 0.4s ease" }} />
                    <div style={{ height: "100%", width: `${pendingPct}%`, background: "#a16207", transition: "width 0.4s ease" }} />
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--muted)" }}>
                    <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", background: "#15803d", marginRight: "4px" }} />{approvedPct}% approved</span>
                    <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", background: "#a16207", marginRight: "4px" }} />{pendingPct}% pending</span>
                  </div>

                  {/* Coaches with expiring certs (next 90 days) */}
                  {(() => {
                    const now = Date.now();
                    const expiringSoon = coaches.filter((c) => {
                      if (!(c as unknown as CoachWithExpiry).certification_expiry) return false;
                      const days = Math.round((new Date((c as unknown as CoachWithExpiry).certification_expiry!).getTime() - now) / 86400000);
                      return days > 0 && days <= 90;
                    }).length;
                    return expiringSoon > 0 ? (
                      <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "#fef9c3", borderRadius: "8px", fontSize: "0.85rem", color: "#a16207" }}>
                        <strong>{expiringSoon}</strong> coach{expiringSoon !== 1 ? "es" : ""} with certification expiring within 90 days
                      </div>
                    ) : null;
                  })()}
                </>
              );
            })()}
          </div>

        </div>
      </section>

      {/* Generated Report Table */}
      {showReport && (
        <section>
          <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Organization Report</h3>
          <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto", marginTop: "0.75rem" }}>
            <table style={{ width: "100%", textAlign: "left", fontSize: "0.85rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Chapter", "Country", "Coaches", "Approved", "CALC", "PALC", "SALC", "MALC", "Revenue (Paid)", "Revenue (Pending)", "Payments"].map((h) => (
                    <th key={h} style={{ padding: "0.5rem 0.5rem", fontSize: "0.7rem", textTransform: "uppercase", color: "var(--muted)" }}>{h}</th>
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

      {/* Recertification Results */}
      {recertCoaches.length > 0 && (
        <section>
          <h3 className="section-title" style={{ fontSize: "1.25rem" }}>
            Coaches Due for Recertification ({recertCoaches.length})
          </h3>
          <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto", marginTop: "0.75rem" }}>
            <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Name", "Level", "Expiry", "Days Left", "Email"].map((h) => (
                    <th key={h} style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recertCoaches.map((c) => {
                  const daysLeft = Math.round((new Date(c.certification_expiry!).getTime() - Date.now()) / 86400000);
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>{c.full_name}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{c.certification_level}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{c.certification_expiry}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        <span className="badge" style={{
                          background: daysLeft <= 30 ? "#fee2e2" : daysLeft <= 60 ? "#fef9c3" : "#dcfce7",
                          color: daysLeft <= 30 ? "#dc2626" : daysLeft <= 60 ? "#a16207" : "#15803d",
                        }}>
                          {daysLeft} days
                        </span>
                      </td>
                      <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted)" }}>{c.contact_email ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* AI-generated reminder previews */}
          {reminderPreviews.length > 0 && (
            <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
              <p className="eyebrow">AI Reminder Previews</p>
              {reminderPreviews.map((rp) => (
                <div key={rp.coachName} className="feature-card" style={{ borderLeft: "4px solid var(--brand)" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    To: <strong>{rp.coachName}</strong> &middot; {rp.daysLeft} days left
                  </p>
                  <p style={{ fontWeight: 600, marginTop: "0.35rem" }}>{rp.subject}</p>
                  <p style={{ marginTop: "0.25rem", color: "var(--foreground)", lineHeight: 1.7, fontSize: "0.9rem" }}>{rp.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Chapters overview */}
      <section>
        <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Chapters</h3>
        <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto", marginTop: "0.75rem" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Name</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Country</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Lead</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((ch) => (
                <tr key={ch.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>{ch.name}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{ch.country}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{ch.contact_name ?? "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <span
                      className="badge"
                      style={{
                        background: ch.is_active ? "#dcfce7" : "var(--surface-muted)",
                        color: ch.is_active ? "#15803d" : "var(--muted)",
                      }}
                    >
                      {ch.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent payments */}
      <section>
        <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Recent Payments</h3>
        <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto", marginTop: "0.75rem" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Payer</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Chapter</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Type</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Amount</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Status</th>
                <th style={{ padding: "0.5rem 0.75rem" }} />
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
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <PaymentBadge status={p.status} />
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    {p.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => markAsOverdue(p.id)}
                        disabled={markingOverdue === p.id}
                        style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", cursor: "pointer", opacity: markingOverdue === p.id ? 0.5 : 1 }}
                        className="button-secondary"
                      >
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

function PaymentBadge({ status }: { status: string }) {
  const bg: Record<string, string> = {
    paid: "#dcfce7",
    pending: "#fef9c3",
    overdue: "#fee2e2",
    failed: "#fee2e2",
  };
  const fg: Record<string, string> = {
    paid: "#15803d",
    pending: "#a16207",
    overdue: "#dc2626",
    failed: "#dc2626",
  };
  return (
    <span
      className="badge"
      style={{ background: bg[status] ?? "var(--surface-muted)", color: fg[status] ?? "var(--muted)" }}
    >
      {status}
    </span>
  );
}
