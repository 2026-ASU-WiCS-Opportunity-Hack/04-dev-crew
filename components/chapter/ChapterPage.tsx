"use client";

import { getPageBySlug, normalizeChapterContent } from "@/lib/chapter-content";
import type { ChapterRecord } from "@/lib/types";
import { ChapterWebsiteRenderer } from "@/components/chapter/ChapterWebsiteRenderer";

interface ChapterPageProps {
  chapter: ChapterRecord;
  pageSlug?: string;
}

export function ChapterPage({ chapter, pageSlug }: ChapterPageProps) {
  const content = normalizeChapterContent(chapter);
  const activePage = getPageBySlug(content, pageSlug) ?? content.pages?.[0];

  if (!activePage || !content.pages) {
    return null;
  }

  return (
    <ChapterWebsiteRenderer
      activePage={activePage}
      chapterName={chapter.name}
      chapterSlug={chapter.slug}
      navItems={content.local_nav_json ?? []}
      pages={content.pages}
    />
  );
}
