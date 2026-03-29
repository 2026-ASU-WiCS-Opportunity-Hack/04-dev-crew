"use client";

import { useState } from "react";

interface CampaignComposerProps {
  chapterId: string | null;
  onCreated?: () => void;
}

export function CampaignComposer({ chapterId, onCreated }: CampaignComposerProps) {
  const [subject, setSubject] = useState("");
  const [templateType, setTemplateType] = useState("announcement");
  const [intentDescription, setIntentDescription] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!subject && !intentDescription) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          templateType,
          subject: subject || "Draft",
          intent: intentDescription,
          segmentFilter: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create campaign");

      const campaign = data.data?.campaign ?? data.campaign;
      if (campaign) {
        setSubject(campaign.subject);
        setBodyHtml(campaign.body_html);
      }
      onCreated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend(campaignId?: string) {
    if (!campaignId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Send failed");
      }
      onCreated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div className="contact-form" style={{ gap: "1rem" }}>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line"
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Template Type</label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
          >
            <option value="announcement">Announcement</option>
            <option value="recertification_reminder">Recertification Reminder</option>
            <option value="event_promotion">Event Promotion</option>
            <option value="payment_reminder">Payment Reminder</option>
          </select>
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">
            Describe what this email should say (AI will generate it)
          </label>
          <textarea
            value={intentDescription}
            onChange={(e) => setIntentDescription(e.target.value)}
            rows={3}
            placeholder="e.g. Remind coaches about the upcoming certification renewal deadline in April"
          />
        </div>
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>}

      <div className="stack-actions">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || (!subject && !intentDescription)}
          className="button-secondary"
          style={{ opacity: generating || (!subject && !intentDescription) ? 0.5 : 1 }}
        >
          {generating ? "Generating..." : "Generate with AI & Save Draft"}
        </button>
      </div>

      {bodyHtml && (
        <div className="feature-card">
          <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Preview</p>
          <div
            className="prose prose-sm max-w-none"
            style={{ color: "var(--foreground)", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>
      )}
    </div>
  );
}
