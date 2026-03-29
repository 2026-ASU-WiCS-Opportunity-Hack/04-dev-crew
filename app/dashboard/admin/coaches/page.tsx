"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CoachRecord } from "@/lib/types";

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoaches();
  }, []);

  async function loadCoaches() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("coaches")
      .select("*")
      .order("full_name");
    setCoaches((data as CoachRecord[]) ?? []);
    setLoading(false);
  }

  async function toggleApproval(coach: CoachRecord) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("coaches")
      .update({ is_approved: !coach.is_approved })
      .eq("id", coach.id);
    await loadCoaches();
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading coaches...</p>;

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "1.5rem" }}>Manage Coaches</h1>
      <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "1rem" }}>
        {coaches.length} total &middot;{" "}
        {coaches.filter((c) => c.is_approved).length} approved &middot;{" "}
        {coaches.filter((c) => !c.is_approved).length} pending
      </p>

      <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Name</th>
              <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Level</th>
              <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Location</th>
              <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Email</th>
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
                  {c.location_city && `${c.location_city}, `}
                  {c.location_country}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted)" }}>{c.contact_email ?? "—"}</td>
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
    </div>
  );
}
