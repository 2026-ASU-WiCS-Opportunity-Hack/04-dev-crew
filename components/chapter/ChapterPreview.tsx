"use client";

import type { ChapterRecord } from "@/lib/types";
import { getDefaultChapterContent } from "@/lib/chapter-content";
import type { GeneratedChapterContent } from "@/lib/types";

interface ChapterPreviewProps {
  content: GeneratedChapterContent;
  chapterName: string;
}

export function ChapterPreview({ content, chapterName }: ChapterPreviewProps) {
  const chapter = {
    id: "preview",
    name: chapterName,
    slug: "preview",
    country: "your chapter",
    language: "en",
    contact_name: null,
    contact_email: null,
    external_website: null,
    content_json: content,
    is_active: true,
    created_at: "",
    updated_at: "",
  } satisfies ChapterRecord;
  const normalized = {
    ...getDefaultChapterContent(chapter),
    ...content,
  };

  return (
    <div className="feature-card">
      <p className="eyebrow" style={{ marginBottom: "1rem" }}>
        Preview — {chapterName}
      </p>

      <h2 className="section-title" style={{ fontSize: "1.6rem" }}>{normalized.hero_headline}</h2>
      <p className="section-copy" style={{ marginTop: "0.5rem" }}>{normalized.hero_subheadline}</p>

      <div className="page-divider" style={{ margin: "1.2rem 0" }} />

      <strong>About</strong>
      <p style={{ marginTop: "0.35rem", color: "var(--muted)", lineHeight: 1.7, fontSize: "0.95rem" }}>{normalized.about_section}</p>

      {normalized.why_action_learning.length > 0 && (
        <>
          <strong style={{ display: "block", marginTop: "1rem" }}>Why Action Learning?</strong>
          <ul className="list-clean">
            {normalized.why_action_learning.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {normalized.coaches_intro && (
        <>
          <strong style={{ display: "block", marginTop: "1rem" }}>Coaches</strong>
          <p style={{ marginTop: "0.35rem", color: "var(--muted)", lineHeight: 1.7, fontSize: "0.95rem" }}>{normalized.coaches_intro}</p>
        </>
      )}

      {normalized.event_highlight && (
        <>
          <strong style={{ display: "block", marginTop: "1rem" }}>Events</strong>
          <p style={{ marginTop: "0.35rem", color: "var(--muted)", lineHeight: 1.7, fontSize: "0.95rem" }}>{normalized.event_highlight}</p>
        </>
      )}

      {normalized.testimonial_formatted && (
        <>
          <strong style={{ display: "block", marginTop: "1rem" }}>Testimonial</strong>
          <p style={{ marginTop: "0.35rem", color: "var(--muted)", fontStyle: "italic", lineHeight: 1.7, fontSize: "0.95rem" }}>
            &ldquo;{normalized.testimonial_formatted}&rdquo;
          </p>
        </>
      )}

      {normalized.cta_text && (
        <p style={{ marginTop: "1.2rem", textAlign: "center", fontWeight: 700, color: "var(--brand-dark)" }}>
          {normalized.cta_text}
        </p>
      )}
    </div>
  );
}
