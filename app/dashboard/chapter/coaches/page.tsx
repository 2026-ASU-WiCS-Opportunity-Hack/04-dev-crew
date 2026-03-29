"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CoachRecord } from "@/lib/types";

export default function ChapterCoachesPage() {
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("chapter_id")
      .eq("id", user.id)
      .single();

    const cid = (profile as { chapter_id: string | null } | null)?.chapter_id ?? null;
    setChapterId(cid);

    if (cid) {
      const { data } = await supabase
        .from("coaches")
        .select("*")
        .eq("chapter_id", cid)
        .order("full_name");
      setCoaches((data as CoachRecord[]) ?? []);
    }
    setLoading(false);
  }

  async function toggleApproval(coach: CoachRecord) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("coaches")
      .update({ is_approved: !coach.is_approved })
      .eq("id", coach.id);
    await loadData();
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "1.5rem" }}>Chapter Coaches</h1>
      <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "1rem" }}>{coaches.length} coaches</p>

      {coaches.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No coaches in this chapter yet.</p>
      ) : (
        <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Name</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Level</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Location</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Status</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>{c.full_name}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{c.certification_level}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted)" }}>
                    {c.location_city && `${c.location_city}, `}{c.location_country}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <span
                      className="badge"
                      style={{
                        background: c.is_approved ? "#dcfce7" : "#fef9c3",
                        color: c.is_approved ? "#15803d" : "#a16207",
                      }}
                    >
                      {c.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <button
                      type="button"
                      onClick={() => toggleApproval(c)}
                      className="home-link"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {c.is_approved ? "Revoke" : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
