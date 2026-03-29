"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BulkEnrollForm } from "@/components/enrollments/BulkEnrollForm";
import { EnrollmentTracker } from "@/components/enrollments/EnrollmentTracker";
import type { ProfileRecord } from "@/lib/types";

interface Enrollment {
  id: string;
  company_name: string;
  company_code: string;
  total_licenses: number;
  used_licenses: number;
  contact_email: string | null;
  contact_name: string | null;
  created_at: string;
}

export default function EnrollmentsPage() {
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = useCallback(async (cId: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("chapter_id", cId)
      .order("created_at", { ascending: false });
    setEnrollments((data as Enrollment[]) ?? []);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("chapter_id")
        .eq("id", user.id)
        .single();

      const cId = (profile as Pick<ProfileRecord, "chapter_id"> | null)?.chapter_id ?? null;
      setChapterId(cId);
      if (cId) await loadEnrollments(cId);
      setLoading(false);
    }
    init();
  }, [loadEnrollments]);

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned to your profile.</p>;

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div>
        <h1 className="page-header">Enrollment Management</h1>
        <p className="section-copy">Create bulk enrollments for corporate partners and track license usage.</p>
      </div>

      <section>
        <h2 className="section-title" style={{ fontSize: "1.25rem" }}>New Bulk Enrollment</h2>
        <BulkEnrollForm chapterId={chapterId} onCreated={() => loadEnrollments(chapterId)} />
      </section>

      <div className="page-divider" />

      <section>
        <h2 className="section-title" style={{ fontSize: "1.25rem" }}>Current Enrollments</h2>
        <EnrollmentTracker enrollments={enrollments} />
      </section>
    </div>
  );
}
