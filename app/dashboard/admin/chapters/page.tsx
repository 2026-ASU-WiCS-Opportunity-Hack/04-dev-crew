import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChapterCard } from "@/components/chapter/ChapterCard";
import type { ChapterRecord } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminChaptersPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .order("name");

  const chapters = (data as ChapterRecord[]) ?? [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 className="section-title">All Chapters</h1>
        <Link
          href="/dashboard/chapter/create"
          className="button-primary"
        >
          + Create Chapter
        </Link>
      </div>

      {chapters.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No chapters yet.</p>
      ) : (
        <div className="card-grid">
          {chapters.map((ch) => (
            <ChapterCard key={ch.id} chapter={ch} />
          ))}
        </div>
      )}
    </div>
  );
}
