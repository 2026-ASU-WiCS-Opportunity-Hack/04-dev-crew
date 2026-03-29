"use client";

import Link from "next/link";
import type { ChapterRecord } from "@/lib/types";

interface ChapterCardProps {
  chapter: ChapterRecord;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <Link href={`/${chapter.slug}`} className="chapter-card" style={{ display: "block" }}>
      <strong>{chapter.name}</strong>
      <p style={{ marginTop: "0.25rem", color: "var(--muted)", fontSize: "0.9rem" }}>
        {chapter.country}
      </p>
      {chapter.contact_name && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
          Lead: {chapter.contact_name}
        </p>
      )}
      {chapter.external_website && (
        <p style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "var(--brand-dark)" }}
           className="truncate">
          {chapter.external_website}
        </p>
      )}
      <span className="home-link" style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}>
        View Chapter &rarr;
      </span>
    </Link>
  );
}
