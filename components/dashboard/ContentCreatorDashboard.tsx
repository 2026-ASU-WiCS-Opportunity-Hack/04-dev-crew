"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CampaignRecord, ChapterRecord, CoachRecord, EventRecord } from "@/lib/types";

interface ContentCreatorDashboardProps {
  chapterId: string;
}

interface ClientSummaryRecord {
  id: string;
  name: string;
}

interface TestimonialSummaryRecord {
  id: string;
  author_name: string;
  created_at: string;
}

export function ContentCreatorDashboard({
  chapterId,
}: ContentCreatorDashboardProps) {
  const [chapter, setChapter] = useState<ChapterRecord | null>(null);
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [clients, setClients] = useState<ClientSummaryRecord[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialSummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const [
        chapterRes,
        coachesRes,
        eventsRes,
        campaignsRes,
        clientsRes,
        testimonialsRes,
      ] = await Promise.all([
        supabase.from("chapters").select("*").eq("id", chapterId).single(),
        supabase.from("coaches").select("*").eq("chapter_id", chapterId).order("full_name"),
        supabase.from("events").select("*").eq("chapter_id", chapterId).order("event_date", { ascending: true }).limit(8),
        supabase.from("campaigns").select("*").eq("chapter_id", chapterId).order("created_at", { ascending: false }).limit(6),
        supabase.from("clients").select("id, name").eq("chapter_id", chapterId).order("name"),
        supabase.from("testimonials").select("id, author_name, created_at").eq("chapter_id", chapterId).order("created_at", { ascending: false }).limit(6),
      ]);

      setChapter((chapterRes.data as ChapterRecord | null) ?? null);
      setCoaches((coachesRes.data as CoachRecord[]) ?? []);
      setEvents((eventsRes.data as EventRecord[]) ?? []);
      setCampaigns((campaignsRes.data as CampaignRecord[]) ?? []);
      setClients((clientsRes.data as ClientSummaryRecord[]) ?? []);
      setTestimonials((testimonialsRes.data as TestimonialSummaryRecord[]) ?? []);
      setLoading(false);
    }

    load();
  }, [chapterId]);

  if (loading) {
    return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  }

  if (!chapter) {
    return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>Chapter not found</p>;
  }

  const content = chapter.content_json;
  const upcomingEvents = events
    .filter((event) => !event.event_date || new Date(event.event_date).getTime() >= startOfToday())
    .slice(0, 4);
  const draftCampaigns = campaigns.filter((campaign) => campaign.status === "draft");
  const approvedCoaches = coaches.filter((coach) => coach.is_approved).length;
  const contentHealthScore = [
    Boolean(content?.hero_headline),
    Boolean(content?.about_section),
    Boolean(content?.coaches_intro),
    Boolean(content?.event_highlight),
    testimonials.length > 0,
    clients.length > 0,
  ].filter(Boolean).length;

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ display: "grid", gap: "0.65rem" }}>
        <div>
          <p style={eyebrowStyle}>Content Creator Dashboard</p>
          <h2 className="section-title">{chapter.name}</h2>
        </div>
        <p style={{ fontSize: "0.95rem", color: "var(--muted)" }}>
          Focused on chapter storytelling, local updates, and campaign-ready content.
        </p>
      </div>

      <div className="hero-stats">
        <div className="stat-card">
          <strong>{contentHealthScore}/6</strong>
          <span>Content Readiness</span>
        </div>
        <div className="stat-card">
          <strong>{upcomingEvents.length}</strong>
          <span>Upcoming Events</span>
        </div>
        <div className="stat-card">
          <strong>{clients.length}</strong>
          <span>Client Stories</span>
        </div>
        <div className="stat-card">
          <strong>{draftCampaigns.length}</strong>
          <span>Draft Campaigns</span>
        </div>
      </div>

      <section style={{ display: "grid", gap: "1rem" }}>
        <h3 className="section-title" style={{ fontSize: "1.15rem" }}>
          Content Priorities
        </h3>
        <div style={priorityGridStyle}>
          <OverviewCard
            title="Homepage Story"
            value={content?.hero_headline ? "Ready" : "Needs Work"}
            description={
              content?.hero_headline
                ? "Hero messaging is in place for the public chapter page."
                : "Add the headline and supporting message for the chapter landing page."
            }
            tone={content?.hero_headline ? "success" : "warning"}
          />
          <OverviewCard
            title="Coach Showcase"
            value={approvedCoaches}
            description={
              approvedCoaches > 0
                ? "Approved coaches can already support the public chapter narrative."
                : "No approved coaches yet to feature on the chapter story."
            }
          />
          <OverviewCard
            title="Social Proof"
            value={testimonials.length}
            description={
              testimonials.length > 0
                ? "Testimonials are available to strengthen trust."
                : "Add testimonials to give visitors local proof points."
            }
          />
          <OverviewCard
            title="Client Visibility"
            value={clients.length}
            description={
              clients.length > 0
                ? "Client organizations are ready to display on the chapter page."
                : "Add client organizations to build credibility."
            }
          />
        </div>
      </section>

      <section style={{ display: "grid", gap: "1rem" }}>
        <h3 className="section-title" style={{ fontSize: "1.15rem" }}>
          Content Workbench
        </h3>
        <div style={priorityGridStyle}>
          <QuickLink
            href="/dashboard/chapter/edit"
            label="Edit Chapter Content"
            description="Update hero, about copy, AI-generated sections, and the public call to action."
          />
          <QuickLink
            href="/dashboard/chapter/events"
            label="Manage Events"
            description="Keep workshops and certifications current so the chapter page stays active."
          />
          <QuickLink
            href="/dashboard/chapter/clients"
            label="Manage Clients"
            description="Add organizations served by the chapter for social proof."
          />
          <QuickLink
            href="/dashboard/chapter/testimonials"
            label="Manage Testimonials"
            description="Capture quotes that reinforce local credibility."
          />
          <QuickLink
            href="/dashboard/chapter/campaigns"
            label="Review Campaigns"
            description="Turn chapter updates into email outreach and event promotion."
          />
        </div>
      </section>

      <div style={panelGridStyle}>
        <DashboardPanel
          title="Current Chapter Copy"
          actionHref="/dashboard/chapter/edit"
          actionLabel="Open Editor"
        >
          <div style={{ display: "grid", gap: "0.9rem" }}>
            <ContentRow
              label="Hero headline"
              value={content?.hero_headline ?? "No hero headline yet."}
            />
            <ContentRow
              label="About section"
              value={content?.about_section ?? "No chapter story written yet."}
            />
            <ContentRow
              label="Call to action"
              value={content?.cta_text ?? "No CTA added yet."}
            />
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Upcoming Story Moments"
          actionHref="/dashboard/chapter/events"
          actionLabel="Open Events"
        >
          {upcomingEvents.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {upcomingEvents.map((event) => (
                <div key={event.id} style={rowStyle}>
                  <div>
                    <p style={rowTitleStyle}>{event.title}</p>
                    <p style={rowMetaStyle}>{event.location || "Location TBA"}</p>
                  </div>
                  <p style={rowMetaStyle}>{formatEventDate(event.event_date)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState copy="No upcoming events yet. Add one so the chapter page stays fresh." />
          )}
        </DashboardPanel>
      </div>

      <div style={panelGridStyle}>
        <DashboardPanel
          title="Recent Testimonials"
          actionHref="/dashboard/chapter/testimonials"
          actionLabel="Open Testimonials"
        >
          {testimonials.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {testimonials.slice(0, 4).map((testimonial) => (
                <div key={testimonial.id} style={rowStyle}>
                  <p style={rowTitleStyle}>{testimonial.author_name}</p>
                  <p style={rowMetaStyle}>{formatEventDate(testimonial.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState copy="No testimonials yet. Add a quote to strengthen the chapter story." />
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Draft Campaigns"
          actionHref="/dashboard/chapter/campaigns"
          actionLabel="Open Campaigns"
        >
          {draftCampaigns.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {draftCampaigns.slice(0, 4).map((campaign) => (
                <div key={campaign.id} style={rowStyle}>
                  <div>
                    <p style={rowTitleStyle}>{campaign.subject}</p>
                    <p style={rowMetaStyle}>{formatLabel(campaign.template_type)}</p>
                  </div>
                  <span className="badge" style={{ background: "#fef3c7", color: "#a16207" }}>
                    Draft
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState copy="No draft campaigns waiting. Create one when you want to promote a chapter update." />
          )}
        </DashboardPanel>
      </div>
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
        <h3 className="section-title" style={{ fontSize: "1.15rem", margin: 0 }}>
          {title}
        </h3>
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
      <strong style={{ fontSize: "1.4rem", color }}>{value}</strong>
      <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.5 }}>{description}</p>
    </div>
  );
}

function ContentRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gap: "0.35rem" }}>
      <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", fontWeight: 700 }}>
        {label}
      </p>
      <p style={{ color: "var(--foreground)", lineHeight: 1.55 }}>{value}</p>
    </div>
  );
}

function EmptyState({ copy }: { copy: string }) {
  return <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>{copy}</p>;
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

const eyebrowStyle: CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--accent)",
};

const priorityGridStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const panelGridStyle: CSSProperties = {
  display: "grid",
  gap: "1.5rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
};

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
