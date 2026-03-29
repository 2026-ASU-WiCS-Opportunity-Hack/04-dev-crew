"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { centsToCurrency } from "@/lib/utils";
import type { ChapterRecord, CoachRecord, PaymentRecord, EventRecord } from "@/lib/types";

interface ChapterDashboardProps {
  chapterId: string;
}

export function ChapterDashboard({ chapterId }: ChapterDashboardProps) {
  const [chapter, setChapter] = useState<ChapterRecord | null>(null);
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const [chapterRes, coachesRes, paymentsRes, eventsRes] = await Promise.all([
        supabase.from("chapters").select("*").eq("id", chapterId).single(),
        supabase.from("coaches").select("*").eq("chapter_id", chapterId).order("full_name"),
        supabase.from("payments").select("*").eq("chapter_id", chapterId).order("created_at", { ascending: false }).limit(10),
        supabase.from("events").select("*").eq("chapter_id", chapterId).order("event_date", { ascending: false }).limit(5),
      ]);
      setChapter(chapterRes.data as ChapterRecord | null);
      setCoaches((coachesRes.data as CoachRecord[]) ?? []);
      setPayments((paymentsRes.data as PaymentRecord[]) ?? []);
      setEvents((eventsRes.data as EventRecord[]) ?? []);
      setLoading(false);
    }

    load();
  }, [chapterId]);

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapter) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>Chapter not found</p>;

  const paidRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div>
        <h2 className="section-title">{chapter.name}</h2>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>{chapter.country} &middot; {chapter.language.toUpperCase()}</p>
      </div>

      {/* Quick stats */}
      <div className="hero-stats">
        <div className="stat-card"><strong>{coaches.length}</strong><span>Coaches</span></div>
        <div className="stat-card"><strong>{events.length}</strong><span>Events</span></div>
        <div className="stat-card"><strong>{payments.length}</strong><span>Payments</span></div>
        <div className="stat-card"><strong>{centsToCurrency(paidRevenue)}</strong><span>Revenue</span></div>
      </div>

      {/* Quick links */}
      <div className="stack-actions" style={{ flexWrap: "wrap" }}>
        <QuickLink href="/dashboard/chapter/coaches" label="Manage Coaches" />
        <QuickLink href="/dashboard/chapter/events" label="Manage Events" />
        <QuickLink href="/dashboard/chapter/payments" label="View Payments" />
        <QuickLink href="/dashboard/chapter/clients" label="Client List" />
        <QuickLink href="/dashboard/chapter/testimonials" label="Testimonials" />
        <QuickLink href="/dashboard/chapter/campaigns" label="Campaigns" />
        <QuickLink href="/dashboard/chapter/edit" label="Edit Chapter" />
      </div>

      {/* Recent coaches */}
      {coaches.length > 0 && (
        <section>
          <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Coaches</h3>
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
            {coaches.slice(0, 5).map((c) => (
              <div key={c.id} className="feature-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem" }}>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--foreground)" }}>{c.full_name}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{c.certification_level} &middot; {c.location_city}</p>
                </div>
                <span
                  className="badge"
                  style={{
                    background: c.is_approved ? "#dcfce7" : "#fef9c3",
                    color: c.is_approved ? "#15803d" : "#a16207",
                  }}
                >
                  {c.is_approved ? "Approved" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="button-secondary">
      {label}
    </Link>
  );
}
