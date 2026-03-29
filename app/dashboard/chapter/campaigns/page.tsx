"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { CampaignList } from "@/components/campaigns/CampaignList";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CampaignRecord } from "@/lib/types";

export default function ChapterCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { chapterId } = useChapterDashboardContext();

  useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      return;
    }

    loadData(chapterId);
  }, [chapterId]);

  async function loadData(currentChapterId: string) {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("chapter_id", currentChapterId)
      .order("created_at", { ascending: false });
    setCampaigns((data as CampaignRecord[]) ?? []);
    setLoading(false);
  }

  async function handleSend(campaignId: string) {
    if (!chapterId) {
      return;
    }

    const res = await fetch("/api/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    if (res.ok) await loadData(chapterId);
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
