import { notFound } from "next/navigation";
import { ChapterAccessDebug } from "@/components/debug/ChapterAccessDebug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EventCalendar } from "@/components/events/EventCalendar";
import type { EventRecord } from "@/lib/types";
import {
  getChapterAccessDebugInfo,
  getOptionalChapterAccessContext,
  requireChapterAccess,
} from "@/lib/chapter-access";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ chapter: string }>;
}

export default async function ChapterEventsPublicPage({ params }: PageProps) {
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
    .select("id, name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!chapterData) notFound();

  const chapter = chapterData as { id: string; name: string };

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("chapter_id", chapter.id)
    .order("event_date", { ascending: true });

  const events = (data as EventRecord[]) ?? [];

  return (
    <>
      <ChapterAccessDebug
        info={getChapterAccessDebugInfo(chapterAccess ?? accessContext)}
      />
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Chapter</span>
          <h1 className="section-title">{chapter.name} &mdash; Events</h1>
          <p className="section-copy">
            Upcoming and past events for this chapter.
          </p>
        </div>
      </section>
      <div className="page-divider" />
      <section className="section">
        <div className="container">
          <EventCalendar events={events} />
        </div>
      </section>
    </>
  );
}
