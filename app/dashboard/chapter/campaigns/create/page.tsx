"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CampaignComposer } from "@/components/campaigns/CampaignComposer";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [chapterName, setChapterName] = useState("");
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

      const cid = (profile as { chapter_id: string | null } | null)?.chapter_id ?? null;
      setChapterId(cid);

      if (cid) {
        const { data: chapter } = await supabase
          .from("chapters")
          .select("name")
          .eq("id", cid)
          .single();
        setChapterName((chapter as { name: string } | null)?.name ?? "");
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <h1 className="section-title">Compose Campaign</h1>
      <CampaignComposer
        chapterId={chapterId}
        onCreated={() => router.push("/dashboard/chapter/campaigns")}
      />
    </div>
  );
}
