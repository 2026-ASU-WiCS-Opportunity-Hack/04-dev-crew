"use client";

import type { CampaignRecord } from "@/lib/types";

interface CampaignListProps {
  campaigns: CampaignRecord[];
  onSend?: (campaignId: string) => void;
}

export function CampaignList({ campaigns, onSend }: CampaignListProps) {
  if (campaigns.length === 0) {
    return <p className="text-sm text-gray-500">No campaigns yet.</p>;
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {campaigns.map((c) => (
        <div key={c.id} className="feature-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong className="truncate" style={{ display: "block" }}>{c.subject}</strong>
              <p style={{ marginTop: "0.2rem", color: "var(--muted)", fontSize: "0.8rem", textTransform: "capitalize" }}>
                {c.template_type.replace(/_/g, " ")} &middot;{" "}
                {c.recipient_count} recipients
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge" style={{
                background: c.status === "sent" ? "#dcfce7" : c.status === "draft" ? "#fef9c3" : "#fee2e2",
                color: c.status === "sent" ? "#15803d" : c.status === "draft" ? "#a16207" : "#b91c1c",
              }}>
                {c.status}
              </span>
              {c.status === "draft" && onSend && (
                <button
                  type="button"
                  onClick={() => onSend(c.id)}
                  className="button-primary"
                  style={{ minHeight: "auto", padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                >
                  Send
                </button>
              )}
            </div>
          </div>
          {c.sent_at && (
            <p style={{ marginTop: "0.35rem", fontSize: "0.8rem", color: "var(--muted)" }}>
              Sent {new Date(c.sent_at).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
