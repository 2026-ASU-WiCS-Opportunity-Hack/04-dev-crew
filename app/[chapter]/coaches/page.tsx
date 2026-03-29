import { notFound } from "next/navigation";
import { ChapterAccessDebug } from "@/components/debug/ChapterAccessDebug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CoachRecord } from "@/lib/types";
import {
  getChapterAccessDebugInfo,
  getOptionalChapterAccessContext,
  requireChapterAccess,
} from "@/lib/chapter-access";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ chapter: string }>;
}

export default async function ChapterCoachesPublicPage({ params }: PageProps) {
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
    .from("coaches")
    .select("*")
    .eq("chapter_id", chapter.id)
    .eq("is_approved", true)
    .order("full_name");

  const coaches = (data as CoachRecord[]) ?? [];

  return (
    <>
      <ChapterAccessDebug
        info={getChapterAccessDebugInfo(chapterAccess ?? accessContext)}
      />
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Chapter</span>
          <h1 className="section-title">{chapter.name} &mdash; Coaches</h1>
          <p className="section-copy">
            {coaches.length} certified Action Learning coach{coaches.length !== 1 && "es"}
          </p>
        </div>
      </section>
      <div className="page-divider" />
      <section className="section">
        <div className="container">
          {coaches.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No approved coaches listed yet.</p>
          ) : (
            <div className="card-grid">
              {coaches.map((c) => (
                <div key={c.id} className="feature-card">
                  <h3 style={{ fontWeight: 600, color: "var(--foreground)" }}>{c.full_name}</h3>
                  <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--brand)" }}>
                    {c.certification_level}
                  </p>
                  {(c.location_city || c.location_country) && (
                    <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                      {c.location_city && `${c.location_city}, `}
                      {c.location_country}
                    </p>
                  )}
                  {c.bio_enhanced && (
                    <p style={{ fontSize: "0.9rem", color: "var(--foreground)", marginTop: "0.5rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {c.bio_enhanced}
                    </p>
                  )}
                  {c.specializations.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
                      {c.specializations.map((s) => (
                        <span key={s} className="badge">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
