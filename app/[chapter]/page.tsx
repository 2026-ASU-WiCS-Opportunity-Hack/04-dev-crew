import { notFound } from "next/navigation";
import { ChapterAccessDebug } from "@/components/debug/ChapterAccessDebug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChapterPage } from "@/components/chapter/ChapterPage";
import type { ChapterRecord, CoachRecord, EventRecord } from "@/lib/types";
import {
  getChapterAccessDebugInfo,
  getOptionalChapterAccessContext,
  requireChapterAccess,
} from "@/lib/chapter-access";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ chapter: string }>;
}

export default async function PublicChapterPage({ params }: PageProps) {
  const { chapter: slug } = await params;

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

  if (!chapterData) notFound();

  const chapter = chapterData as ChapterRecord;

  const [coachesRes, eventsRes, testimonialsRes] = await Promise.all([
    supabase
      .from("coaches")
      .select("*")
      .eq("chapter_id", chapter.id)
      .eq("is_approved", true)
      .order("full_name"),
    supabase
      .from("events")
      .select("*")
      .eq("chapter_id", chapter.id)
      .order("event_date", { ascending: true }),
    supabase
      .from("testimonials")
      .select("*")
      .eq("chapter_id", chapter.id)
      .order("created_at", { ascending: false }),
  ]);

  const coaches = (coachesRes.data as CoachRecord[]) ?? [];
  const events = (eventsRes.data as EventRecord[]) ?? [];
  const testimonials =
    (testimonialsRes.data as {
      id: string;
      quote_text: string;
      author_name: string;
      author_title: string | null;
      organization: string | null;
    }[]) ?? [];

  return (
    <>
      <ChapterAccessDebug
        info={getChapterAccessDebugInfo(chapterAccess ?? accessContext)}
      />
      <ChapterPage
        chapter={chapter}
        coaches={coaches}
        events={events}
        testimonials={testimonials}
      />
    </>
  );
}
