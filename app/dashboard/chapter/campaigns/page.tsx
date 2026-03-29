"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CampaignList } from "@/components/campaigns/CampaignList";
import type { CampaignRecord } from "@/lib/types";
import Link from "next/link";

export default function ChapterCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
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
        .from("campaigns")
        .select("*")
        .eq("chapter_id", cid)
        .order("created_at", { ascending: false });
      setCampaigns((data as CampaignRecord[]) ?? []);
    }
    setLoading(false);
  }

  async function handleSend(campaignId: string) {
    const supabase = createSupabaseBrowserClient();
    const res = await fetch("/api/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    if (res.ok) await loadData();
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="section-title">Email Campaigns</h1>
        <Link
          href="/dashboard/chapter/campaigns/create"
          className="button-primary"
        >
          New Campaign
        </Link>
      </div>

      <CampaignList campaigns={campaigns} onSend={handleSend} />
    </div>
  );
}
