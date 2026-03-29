"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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

  const totalPaid = payments.filter((p) => p.status === "paid").length;
  const conversionRate = payments.length > 0 ? Math.round((totalPaid / payments.length) * 100) : 0;

  /* ── Chapters with payment issues ── */
  const chaptersNoPayment = chapters.filter(
    (ch) => !payments.some((p) => p.chapter_id === ch.id),
  );
  const chaptersUnpaid = chapters.filter((ch) => {
    const chPayments = payments.filter((p) => p.chapter_id === ch.id);
    return chPayments.length > 0 && !chPayments.some((p) => p.status === "paid");
  });

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

  return (
    <div style={{ display: "grid", gap: "2rem" }}>

      {/* Stats */}
      <div className="hero-stats">
        <div className="stat-card"><strong>{chapters.length}</strong><span>Chapters</span></div>
        <div className="stat-card"><strong>{coaches.length}</strong><span>Coaches</span></div>
        <div className="stat-card"><strong>{coaches.filter((c) => c.is_approved).length}</strong><span>Approved Coaches</span></div>
        <div className="stat-card"><strong>{payments.length}</strong><span>Payments</span></div>
        <div className="stat-card">
          <strong style={{ color: conversionRate >= 90 ? "#15803d" : conversionRate >= 70 ? "#a16207" : "#dc2626" }}>
            {conversionRate}%
          </strong>
          <span>Payment Conversion</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="stack-actions" style={{ flexWrap: "wrap" }}>
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
                    <span className="badge" style={{
                      background: ch.is_active ? "#dcfce7" : "var(--surface-muted)",
                      color: ch.is_active ? "#15803d" : "var(--muted)",
                    }}>
                      {ch.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
