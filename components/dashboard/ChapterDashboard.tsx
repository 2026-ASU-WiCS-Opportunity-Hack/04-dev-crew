"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { centsToCurrency } from "@/lib/utils";
import type { ChapterRecord, CoachRecord, PaymentRecord, EventRecord, CampaignRecord } from "@/lib/types";

interface ChapterDashboardProps {
  chapterId: string;
}

interface EnrollmentSummaryRecord {
  id: string;
  company_name: string;
  company_code: string;
  total_licenses: number;
  used_licenses: number;
  created_at: string;
}

export function ChapterDashboard({ chapterId }: ChapterDashboardProps) {
  const [chapter, setChapter] = useState<ChapterRecord | null>(null);
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentSummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const [chapterRes, coachesRes, paymentsRes, eventsRes, campaignsRes, enrollmentsRes] = await Promise.all([
        supabase.from("chapters").select("*").eq("id", chapterId).single(),
        supabase.from("coaches").select("*").eq("chapter_id", chapterId).order("full_name"),
        supabase.from("payments").select("*").eq("chapter_id", chapterId).order("created_at", { ascending: false }).limit(10),
        supabase.from("events").select("*").eq("chapter_id", chapterId).order("event_date", { ascending: true }).limit(8),
        supabase.from("campaigns").select("*").eq("chapter_id", chapterId).order("created_at", { ascending: false }).limit(5),
        supabase.from("enrollments").select("*").eq("chapter_id", chapterId).order("created_at", { ascending: false }).limit(5),
      ]);
      setChapter(chapterRes.data as ChapterRecord | null);
      setCoaches((coachesRes.data as CoachRecord[]) ?? []);
      setPayments((paymentsRes.data as PaymentRecord[]) ?? []);
      setEvents((eventsRes.data as EventRecord[]) ?? []);
      setCampaigns((campaignsRes.data as CampaignRecord[]) ?? []);
      setEnrollments((enrollmentsRes.data as EnrollmentSummaryRecord[]) ?? []);
      setLoading(false);
    }

    load();
  }, [chapterId]);

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapter) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>Chapter not found</p>;

  const approvedCoaches = coaches.filter((coach) => coach.is_approved).length;
  const pendingCoachApprovals = coaches.filter((coach) => !coach.is_approved).length;
  const paidRevenue = payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amount_cents, 0);
  const pendingRevenue = payments
    .filter((payment) => payment.status === "pending" || payment.status === "overdue")
    .reduce((sum, payment) => sum + payment.amount_cents, 0);
  const upcomingEvents = events
    .filter((event) => !event.event_date || new Date(event.event_date).getTime() >= startOfToday())
    .slice(0, 3);
  const draftCampaigns = campaigns.filter((campaign) => campaign.status === "draft").length;
  const totalLicenses = enrollments.reduce((sum, enrollment) => sum + enrollment.total_licenses, 0);
  const usedLicenses = enrollments.reduce((sum, enrollment) => sum + enrollment.used_licenses, 0);

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ display: "grid", gap: "0.6rem" }}>
        <div>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>
            Chapter Lead Dashboard
          </p>
          <h2 className="section-title">{chapter.name}</h2>
        </div>
        <p style={{ fontSize: "0.95rem", color: "var(--muted)" }}>
          {chapter.country} &middot; {chapter.language.toUpperCase()}
          {chapter.contact_name ? ` &middot; Lead: ${chapter.contact_name}` : ""}
        </p>
        {chapter.contact_email && (
          <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            Contact: {chapter.contact_email}
          </p>
        )}
      </div>

      <div className="hero-stats">
        <div className="stat-card">
          <strong>{approvedCoaches}</strong>
          <span>Approved Coaches</span>
        </div>
        <div className="stat-card">
          <strong>{events.length}</strong>
          <span>Events</span>
        </div>
        <div className="stat-card">
          <strong>{centsToCurrency(paidRevenue)}</strong>
          <span>Revenue</span>
        </div>
        <div className="stat-card">
          <strong>{centsToCurrency(pendingRevenue)}</strong>
          <span>Pending</span>
        </div>
      </div>

      <section style={{ display: "grid", gap: "1rem" }}>
        <h3 className="section-title" style={{ fontSize: "1.15rem" }}>At a Glance</h3>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <OverviewCard
            title="Coach Approvals"
            value={pendingCoachApprovals}
            description={pendingCoachApprovals === 1 ? "coach needs review" : "coaches need review"}
            tone={pendingCoachApprovals > 0 ? "warning" : "success"}
          />
          <OverviewCard
            title="Upcoming Events"
            value={upcomingEvents.length}
            description={upcomingEvents.length > 0 ? "events already scheduled" : "no future events yet"}
          />
          <OverviewCard
            title="Draft Campaigns"
            value={draftCampaigns}
            description={draftCampaigns > 0 ? "ready to review or send" : "no drafts waiting"}
          />
          <OverviewCard
            title="Enrollment Licenses"
            value={`${usedLicenses}/${totalLicenses || 0}`}
            description={totalLicenses > 0 ? "used across company enrollments" : "no bulk enrollments yet"}
          />
        </div>
      </section>

      <section style={{ display: "grid", gap: "1rem" }}>
        <h3 className="section-title" style={{ fontSize: "1.15rem" }}>Quick Actions</h3>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <QuickLink href="/dashboard/chapter/coaches" label="Manage Coaches" description="Approve, edit, and enhance coach profiles." />
          <QuickLink href="/dashboard/chapter/events" label="Manage Events" description="Create and update local events and RSVPs." />
          <QuickLink href="/dashboard/chapter/payments" label="Payments" description="Track revenue and create new payment links." />
          <QuickLink href="/dashboard/chapter/clients" label="Clients" description="Showcase organizations your chapter serves." />
          <QuickLink href="/dashboard/chapter/testimonials" label="Testimonials" description="Highlight client quotes and social proof." />
          <QuickLink href="/dashboard/chapter/campaigns" label="Campaigns" description="Draft and send chapter-wide email outreach." />
          <QuickLink href="/dashboard/chapter/enrollments" label="Enrollments" description="Manage company codes and license usage." />
          <QuickLink href="/dashboard/chapter/edit" label="Edit Chapter" description="Update chapter details and public-facing content." />
        </div>
      </section>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <DashboardPanel
          title="Recent Payments"
          actionHref="/dashboard/chapter/payments"
          actionLabel="Open Payments"
        >
          {payments.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {payments.slice(0, 4).map((payment) => (
                <div key={payment.id} style={rowStyle}>
                  <div>
                    <p style={rowTitleStyle}>{payment.payer_name}</p>
                    <p style={rowMetaStyle}>
                      {formatLabel(payment.payment_type)} &middot; {payment.student_count} students
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={rowTitleStyle}>{centsToCurrency(payment.amount_cents)}</p>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState copy="No payments yet. Create the first payment from the payments page." />
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Upcoming Events"
          actionHref="/dashboard/chapter/events"
          actionLabel="Open Events"
        >
          {upcomingEvents.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {upcomingEvents.map((event) => (
                <div key={event.id} style={rowStyle}>
                  <div>
                    <p style={rowTitleStyle}>{event.title}</p>
                    <p style={rowMetaStyle}>
                      {event.location || "Location TBA"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={rowTitleStyle}>{formatEventDate(event.event_date)}</p>
                    <p style={rowMetaStyle}>{event.capacity ? `${event.capacity} seats` : "Open capacity"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState copy="No upcoming events yet. Add your next certification or workshop." />
          )}
        </DashboardPanel>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <DashboardPanel
          title="Enrollment Snapshot"
          actionHref="/dashboard/chapter/enrollments"
          actionLabel="Open Enrollments"
        >
          {enrollments.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} style={rowStyle}>
                  <div>
                    <p style={rowTitleStyle}>{enrollment.company_name}</p>
                    <p style={rowMetaStyle}>{enrollment.company_code}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={rowTitleStyle}>
                      {enrollment.used_licenses}/{enrollment.total_licenses}
                    </p>
                    <p style={rowMetaStyle}>licenses used</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState copy="No company enrollments yet. Create a code for your next partner organization." />
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Recent Campaigns"
          actionHref="/dashboard/chapter/campaigns"
          actionLabel="Open Campaigns"
        >
          {campaigns.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {campaigns.map((campaign) => (
                <div key={campaign.id} style={rowStyle}>
                  <div>
                    <p style={rowTitleStyle}>{campaign.subject}</p>
                    <p style={rowMetaStyle}>
                      {formatLabel(campaign.template_type)} &middot; {campaign.recipient_count} recipients
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatusBadge status={campaign.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState copy="No campaigns yet. Create a campaign to promote events or send reminders." />
          )}
        </DashboardPanel>
      </div>

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h3 className="section-title" style={{ fontSize: "1.15rem" }}>Coaches</h3>
          <Link href="/dashboard/chapter/coaches" className="button-secondary">
            Open Coach Manager
          </Link>
        </div>
        {coaches.length > 0 ? (
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
            {coaches.slice(0, 5).map((coach) => (
              <div key={coach.id} className="feature-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem" }}>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--foreground)" }}>{coach.full_name}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {coach.certification_level}
                    {coach.location_city ? ` · ${coach.location_city}` : ""}
                  </p>
                </div>
                <StatusBadge status={coach.is_approved ? "approved" : "pending"} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState copy="No coaches yet. Add your first coach profile from the coaches page." />
        )}
      </section>
    </div>
  );
}

function QuickLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="feature-card"
      style={{ display: "grid", gap: "0.5rem", textDecoration: "none", minHeight: "140px" }}
    >
      <strong style={{ color: "var(--foreground)", fontSize: "1rem" }}>{label}</strong>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>{description}</p>
      <span style={{ color: "var(--accent)", fontWeight: 700, marginTop: "auto" }}>Open</span>
    </Link>
  );
}

function DashboardPanel({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref: string;
  actionLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="contact-card" style={{ display: "grid", gap: "1rem", padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <h3 className="section-title" style={{ fontSize: "1.15rem", margin: 0 }}>{title}</h3>
        <Link href={actionHref} className="button-secondary">
          {actionLabel}
        </Link>
      </div>
      {children}
    </section>
  );
}

function OverviewCard({
  title,
  value,
  description,
  tone = "default",
}: {
  title: string;
  value: string | number;
  description: string;
  tone?: "default" | "warning" | "success";
}) {
  const color =
    tone === "warning" ? "#a16207" : tone === "success" ? "#15803d" : "var(--foreground)";

  return (
    <div className="contact-card" style={{ padding: "1.25rem", display: "grid", gap: "0.45rem" }}>
      <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", fontWeight: 700 }}>
        {title}
      </p>
      <strong style={{ fontSize: "1.8rem", color }}>{value}</strong>
      <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>{description}</p>
    </div>
  );
}

function EmptyState({ copy }: { copy: string }) {
  return <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>{copy}</p>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles =
    normalized === "paid" || normalized === "approved" || normalized === "sent"
      ? { background: "#dcfce7", color: "#15803d" }
      : normalized === "pending" || normalized === "draft" || normalized === "overdue"
        ? { background: "#fef3c7", color: "#a16207" }
        : { background: "#fee2e2", color: "#b91c1c" };

  return (
    <span className="badge" style={styles}>
      {formatLabel(normalized)}
    </span>
  );
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatEventDate(value: string | null) {
  if (!value) return "Date TBA";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  paddingBottom: "0.75rem",
  borderBottom: "1px solid var(--border)",
};

const rowTitleStyle: CSSProperties = {
  fontWeight: 600,
  color: "var(--foreground)",
};

const rowMetaStyle: CSSProperties = {
  fontSize: "0.82rem",
  color: "var(--muted)",
};
