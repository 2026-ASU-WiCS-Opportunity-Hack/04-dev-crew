"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ChapterDashboard } from "@/components/dashboard/ChapterDashboard";
import type { ProfileRecord } from "@/lib/types";

export default function ChapterDashboardPage() {
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("chapter_id")
        .eq("id", user.id)
        .single();

      setChapterId((profile as Pick<ProfileRecord, "chapter_id"> | null)?.chapter_id ?? null);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned to your profile.</p>;

  return <ChapterDashboard chapterId={chapterId} />;
}
