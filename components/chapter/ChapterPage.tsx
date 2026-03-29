"use client";

import type { GeneratedChapterContent, ChapterRecord, CoachRecord, EventRecord } from "@/lib/types";

interface ChapterPageProps {
  chapter: ChapterRecord;
  coaches: CoachRecord[];
  events: EventRecord[];
  testimonials: { quote_text: string; author_name: string; author_title: string | null; organization: string | null }[];
}

export function ChapterPage({ chapter, coaches, events, testimonials }: ChapterPageProps) {
  const content = chapter.content_json as GeneratedChapterContent | null;

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

      <div className="page-divider" />

      {/* About */}
      {content?.about_section && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">About</h2>
            <p className="section-copy">{content.about_section}</p>
          </div>
        </section>
      )}

      {/* Why Action Learning */}
      {content?.why_action_learning && content.why_action_learning.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Why Action Learning?</h2>
            <ul className="hero-points" style={{ marginTop: "1.25rem" }}>
              {content.why_action_learning.map((point, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
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
      )}

      {/* Coaches */}
      {coaches.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">
              {content?.coaches_intro ?? "Our Coaches"}
            </h2>
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
      )}

      {/* Events */}
      {events.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">
              {content?.event_highlight ? "Upcoming Events" : "Events"}
            </h2>
            {content?.event_highlight && (
              <p className="section-copy">{content.event_highlight}</p>
            )}
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
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Testimonials</h2>
            <div style={{ display: "grid", gap: "1.25rem", marginTop: "1.25rem" }}>
              {testimonials.map((t, i) => (
                <blockquote
                  key={i}
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
      )}

      {/* CTA */}
      {content?.cta_text && (
        <section className="cta-shell" style={{ textAlign: "center" }}>
          <div className="container">
            <p className="section-title" style={{ fontSize: "1.25rem" }}>{content.cta_text}</p>
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
      )}
    </div>
  );
}
