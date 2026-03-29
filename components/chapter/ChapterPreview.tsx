"use client";

import { getPageBySlug, normalizeChapterContent } from "@/lib/chapter-content";
import type { ChapterRecord, GeneratedChapterContent } from "@/lib/types";
import { ChapterWebsiteRenderer } from "@/components/chapter/ChapterWebsiteRenderer";

interface ChapterPreviewProps {
  content: GeneratedChapterContent;
  chapterName: string;
  activePageSlug?: string;
}

export function ChapterPreview({
  content,
  chapterName,
  activePageSlug,
}: ChapterPreviewProps) {
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

  const normalized = normalizeChapterContent(chapter);
  const activePage = getPageBySlug(normalized, activePageSlug) ?? normalized.pages?.[0];

  if (!activePage || !normalized.pages) {
    return null;
  }

  return (
    <ChapterWebsiteRenderer
      activePage={activePage}
      chapterName={chapterName}
      navItems={normalized.local_nav_json ?? []}
      pages={normalized.pages}
      preview
    />
  );
}
