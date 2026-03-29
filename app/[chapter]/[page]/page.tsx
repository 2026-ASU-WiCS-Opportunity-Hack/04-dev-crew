import { notFound } from "next/navigation";

import { ChapterPage } from "@/components/chapter/ChapterPage";
import { ChapterAccessDebug } from "@/components/debug/ChapterAccessDebug";
import { getPageBySlug, normalizeChapterContent } from "@/lib/chapter-content";
import {
  getChapterAccessDebugInfo,
  getOptionalChapterAccessContext,
  requireChapterAccess,
} from "@/lib/chapter-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ChapterRecord } from "@/lib/types";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ chapter: string; page: string }>;
}

export default async function PublicChapterSubPage({ params }: PageProps) {
  const { chapter: slug, page: pageSlug } = await params;

  const accessContext = await getOptionalChapterAccessContext();
  let chapterAccess:
    | Awaited<ReturnType<typeof requireChapterAccess>>
    | null = null;

  if (accessContext?.profile?.role === "chapter_lead") {
    chapterAccess = await requireChapterAccess(slug, {
      allowedRoles: ["chapter_lead"],
      onMismatch: "redirect",
    });
  }

  const supabase = await createSupabaseServerClient();

  const { data: chapterData } = await supabase
    .from("chapters")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!chapterData) {
    notFound();
  }

  const chapter = chapterData as ChapterRecord;
  const content = normalizeChapterContent(chapter);

  if (!getPageBySlug(content, pageSlug)) {
    notFound();
  }

  return (
    <>
      <ChapterAccessDebug
        info={getChapterAccessDebugInfo(chapterAccess ?? accessContext)}
      />
      <ChapterPage chapter={chapter} pageSlug={pageSlug} />
    </>
  );
}
