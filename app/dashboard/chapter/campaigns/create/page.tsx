"use client";

import { useRouter } from "next/navigation";

import { CampaignComposer } from "@/components/campaigns/CampaignComposer";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { chapterId } = useChapterDashboardContext();

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
