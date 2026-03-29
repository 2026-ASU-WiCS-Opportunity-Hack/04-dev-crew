"use client";

import type { GeneratedChapterContent } from "@/lib/types";

interface ChapterPreviewProps {
  content: GeneratedChapterContent;
  chapterName: string;
}

export function ChapterPreview({ content, chapterName }: ChapterPreviewProps) {
  return (
    <div className="feature-card">
      <p className="eyebrow" style={{ marginBottom: "1rem" }}>
        Preview — {chapterName}
      </p>

      <h2 className="section-title" style={{ fontSize: "1.6rem" }}>{content.hero_headline}</h2>
      <p className="section-copy" style={{ marginTop: "0.5rem" }}>{content.hero_subheadline}</p>

      <div className="page-divider" style={{ margin: "1.2rem 0" }} />

      <strong>About</strong>
      <p style={{ marginTop: "0.35rem", color: "var(--muted)", lineHeight: 1.7, fontSize: "0.95rem" }}>{content.about_section}</p>

      {content.why_action_learning.length > 0 && (
        <>
          <strong style={{ display: "block", marginTop: "1rem" }}>Why Action Learning?</strong>
          <ul className="list-clean">
            {content.why_action_learning.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {content.coaches_intro && (
        <>
          <strong style={{ display: "block", marginTop: "1rem" }}>Coaches</strong>
          <p style={{ marginTop: "0.35rem", color: "var(--muted)", lineHeight: 1.7, fontSize: "0.95rem" }}>{content.coaches_intro}</p>
        </>
      )}

      {content.event_highlight && (
        <>
          <strong style={{ display: "block", marginTop: "1rem" }}>Events</strong>
          <p style={{ marginTop: "0.35rem", color: "var(--muted)", lineHeight: 1.7, fontSize: "0.95rem" }}>{content.event_highlight}</p>
        </>
      )}

      {content.testimonial_formatted && (
        <>
          <strong style={{ display: "block", marginTop: "1rem" }}>Testimonial</strong>
          <p style={{ marginTop: "0.35rem", color: "var(--muted)", fontStyle: "italic", lineHeight: 1.7, fontSize: "0.95rem" }}>
            &ldquo;{content.testimonial_formatted}&rdquo;
          </p>
        </>
      )}

      {content.cta_text && (
        <p style={{ marginTop: "1.2rem", textAlign: "center", fontWeight: 700, color: "var(--brand-dark)" }}>
          {content.cta_text}
        </p>
      )}
    </div>
  );
}
