"use client";

import { useState } from "react";
import { ChapterPreview } from "@/components/chapter/ChapterPreview";
import type { GeneratedChapterContent, ChapterGenerationInput } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface CreateChapterFormProps {
  onCreated?: () => void;
}

export function CreateChapterForm({ onCreated }: CreateChapterFormProps) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [password, setPassword] = useState("");
  const [coachNames, setCoachNames] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [testimonial, setTestimonial] = useState("");

  const [preview, setPreview] = useState<GeneratedChapterContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      const input: ChapterGenerationInput = {
        chapterName: name,
        country,
        language,
        contactName: contactName || undefined,
        coachNames: coachNames
          ? coachNames.split(",").map((n) => n.trim())
          : undefined,
        eventTitle: eventTitle || undefined,
        eventDate: eventDate || undefined,
        testimonial: testimonial || undefined,
      };

      const res = await fetch("/api/ai/generate-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to generate content");
      }

      const data = await res.json();
      setPreview(data.data?.content ?? data.content);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!name || !country) {
      setError("Name and country are required");
      return;
    }
    if (!contactEmail || !password) {
      setError("Contact email and password are required to create the chapter lead account");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/chapters/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slugify(name),
          country,
          language,
          contactName: contactName || null,
          contactEmail: contactEmail || null,
          password,
          content: preview,
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to create chapter");

      setSuccess(`Chapter "${name}" created successfully. Login credentials have been sent to ${contactEmail}.`);
      setName("");
      setCountry("");
      setLanguage("en");
      setContactName("");
      setContactEmail("");
      setPassword("");
      setCoachNames("");
      setEventTitle("");
      setEventDate("");
      setTestimonial("");
      setPreview(null);
      onCreated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save chapter");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="contact-form" style={{ gap: "1.5rem" }}>
      <div className="card-grid">
        <div className="contact-form__field-group">
          <label className="contact-form__label">Chapter Name <span>*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="WIAL Kenya"
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Country <span>*</span></label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Kenya"
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="pt">Portuguese</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Contact Name</label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Contact Email <span>*</span></label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="lead@example.com"
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">
            One-Time Password <span>*</span>
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
          />
        </div>
      </div>

      <div className="page-divider" />
      <p className="eyebrow">AI Content Generation</p>
      <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: "-0.5rem" }}>
        Optional — provide details for AI to generate page content
      </p>

      <div className="card-grid">
        <div className="contact-form__field-group">
          <label className="contact-form__label">Coach Names (comma-separated)</label>
          <input
            type="text"
            value={coachNames}
            onChange={(e) => setCoachNames(e.target.value)}
            placeholder="Grace Muthoni, David Ochieng"
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Event Title</label>
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Event Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
          <label className="contact-form__label">Testimonial (optional)</label>
          <textarea
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>
      )}
      {success && (
        <p style={{ color: "#15803d", fontSize: "0.9rem", fontWeight: 600 }}>{success}</p>
      )}

      <div className="stack-actions">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !name || !country}
          className="button-secondary"
          style={{ opacity: generating || !name || !country ? 0.5 : 1 }}
        >
          {generating ? "Generating..." : "Generate with AI"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name || !country || !contactEmail || !password}
          className="button-primary"
          style={{ opacity: saving || !name || !country || !contactEmail || !password ? 0.5 : 1 }}
        >
          {saving ? "Creating..." : "Create Chapter"}
        </button>
      </div>

      {preview && <ChapterPreview content={preview} chapterName={name} />}
    </div>
  );
}
