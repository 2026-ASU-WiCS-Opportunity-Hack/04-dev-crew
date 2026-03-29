"use client";

import { normalizeChapterContent } from "@/lib/chapter-content";
import type { ChapterContentSection, ChapterRecord, CoachRecord, EventRecord } from "@/lib/types";

interface ChapterPageProps {
  chapter: ChapterRecord;
  coaches: CoachRecord[];
  events: EventRecord[];
  testimonials: { quote_text: string; author_name: string; author_title: string | null; organization: string | null }[];
}

export function ChapterPage({ chapter, coaches, events, testimonials }: ChapterPageProps) {
  const content = normalizeChapterContent(chapter);
  const localNavItems = content.local_nav_json ?? [];

  function renderSection(section: ChapterContentSection) {
    if (section.type === "about") {
      return (
        <section className="section" id={section.id} key={section.id}>
          <div className="container">
            <h2 className="section-title">{section.title}</h2>
            <p className="section-copy">{section.body || content.about_section}</p>
          </div>
        </section>
      );
    }

    if (section.type === "why_action_learning") {
      const items = section.items?.length ? section.items : content.why_action_learning;
      if (items.length === 0) return null;
      return (
        <section className="section" id={section.id} key={section.id}>
          <div className="container">
            <h2 className="section-title">{section.title}</h2>
            <ul className="hero-points" style={{ marginTop: "1.25rem" }}>
              {items.map((point, i) => (
                <li key={`${section.id}-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: "1.5rem", height: "1.5rem", borderRadius: "50%",
                      background: "var(--brand)", color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, marginTop: "0.15rem",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }

    if (section.type === "coaches") {
      if (coaches.length === 0) return null;
      return (
        <section className="section" id={section.id} key={section.id}>
          <div className="container">
            <h2 className="section-title">{section.title}</h2>
            {section.body ? <p className="section-copy">{section.body}</p> : null}
            <div className="card-grid" style={{ marginTop: "1.25rem" }}>
              {coaches.map((coach) => (
                <div key={coach.id} className="feature-card">
                  <p style={{ fontWeight: 600, color: "var(--foreground)" }}>{coach.full_name}</p>
                  <p style={{ fontSize: "0.9rem", color: "var(--brand)" }}>{coach.certification_level}</p>
                  {coach.location_city && (
                    <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                      {coach.location_city}, {coach.location_country}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section.type === "events") {
      if (events.length === 0) return null;
      return (
        <section className="section" id={section.id} key={section.id}>
          <div className="container">
            <h2 className="section-title">{section.title}</h2>
            {section.body ? <p className="section-copy">{section.body}</p> : null}
            <div style={{ display: "grid", gap: "1rem", marginTop: "1.25rem" }}>
              {events.map((event) => (
                <div key={event.id} className="feature-card">
                  <p style={{ fontWeight: 600, color: "var(--foreground)" }}>{event.title}</p>
                  {event.event_date && (
                    <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                      {new Date(event.event_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                  {event.location && (
                    <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>{event.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section.type === "testimonials") {
      if (testimonials.length === 0) return null;
      return (
        <section className="section" id={section.id} key={section.id}>
          <div className="container">
            <h2 className="section-title">{section.title}</h2>
            {section.body ? <p className="section-copy">{section.body}</p> : null}
            <div style={{ display: "grid", gap: "1.25rem", marginTop: "1.25rem" }}>
              {testimonials.map((t, i) => (
                <blockquote
                  key={`${section.id}-${i}`}
                  className="feature-card"
                  style={{ borderLeft: "4px solid var(--brand)", fontStyle: "italic" }}
                >
                  <p style={{ color: "var(--foreground)" }}>&ldquo;{t.quote_text}&rdquo;</p>
                  <footer style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--muted)", fontStyle: "normal" }}>
                    — {t.author_name}
                    {t.author_title && `, ${t.author_title}`}
                    {t.organization && ` at ${t.organization}`}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section.type === "cta") {
      return (
        <section className="cta-shell" style={{ textAlign: "center" }} id={section.id} key={section.id}>
          <div className="container">
            <p className="section-title" style={{ fontSize: "1.25rem" }}>
              {section.body || content.cta_text}
            </p>
            {chapter.contact_email && (
              <a
                href={`mailto:${chapter.contact_email}`}
                className="button-primary"
                style={{ marginTop: "1rem", display: "inline-block" }}
              >
                Contact Us
              </a>
            )}
          </div>
        </section>
      );
    }

    return (
      <section className="section" id={section.id} key={section.id}>
        <div className="container">
          <h2 className="section-title">{section.title}</h2>
          {section.body ? <p className="section-copy">{section.body}</p> : null}
          {section.items?.length ? (
            <ul className="hero-points" style={{ marginTop: "1.25rem" }}>
              {section.items.map((item, index) => (
                <li key={`${section.id}-item-${index}`}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="page-header">
        <div className="container" style={{ textAlign: "center" }}>
          <h1 className="section-title" style={{ fontSize: "2.5rem" }}>
            {content?.hero_headline ?? chapter.name}
          </h1>
          <p className="section-copy">
            {content?.hero_subheadline ?? `Action Learning in ${chapter.country}`}
          </p>
          {chapter.external_website && (
            <a
              href={chapter.external_website}
              target="_blank"
              rel="noopener noreferrer"
              className="home-link"
              style={{ marginTop: "1rem", display: "inline-block" }}
            >
              Visit our main website &rarr;
            </a>
          )}
        </div>
      </section>

      {localNavItems.length > 0 ? (
        <section className="section" style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}>
          <div className="container" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {localNavItems.map((item) => (
              <a
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="button-secondary"
                style={{ fontSize: "0.85rem" }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <div className="page-divider" />

      {content.sections?.map((section) => renderSection(section))}
    </div>
  );
}
