"use client";

import { useEffect, useState } from "react";

import { ChapterPreview } from "@/components/chapter/ChapterPreview";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ChapterRecord, GeneratedChapterContent, ChapterGenerationInput } from "@/lib/types";

export default function EditChapterPage() {
  const [chapter, setChapter] = useState<ChapterRecord | null>(null);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [externalWebsite, setExternalWebsite] = useState("");
  const [language, setLanguage] = useState("en");
  const [coachNames, setCoachNames] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [preview, setPreview] = useState<GeneratedChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { chapterId } = useChapterDashboardContext();

  useEffect(() => {
    async function load() {
      if (!chapterId) { setLoading(false); return; }

      const supabase = createSupabaseBrowserClient();
      const { data: ch } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();

      const chapterData = ch as ChapterRecord | null;
      if (chapterData) {
        setChapter(chapterData);
        setName(chapterData.name);
        setContactName(chapterData.contact_name ?? "");
        setContactEmail(chapterData.contact_email ?? "");
        setExternalWebsite(chapterData.external_website ?? "");
        setLanguage(chapterData.language);
        if (chapterData.content_json) {
          setPreview(chapterData.content_json);
        }
      }
      setLoading(false);
    }
    load();
  }, [chapterId]);

  async function handleRegenerate() {
    if (!chapter) return;
    setGenerating(true);
    setError(null);
    try {
      const input: ChapterGenerationInput = {
        chapterName: name,
        country: chapter.country,
        language,
        contactName: contactName || undefined,
        coachNames: coachNames ? coachNames.split(",").map((n) => n.trim()) : undefined,
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
        throw new Error(data.error ?? "Generation failed");
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
    if (!chapter) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from("chapters")
        .update({
          name,
          contact_name: contactName || null,
          contact_email: contactEmail || null,
          external_website: externalWebsite || null,
          language,
          content_json: preview,
        })
        .eq("id", chapter.id);

      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapter) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned to your profile.</p>;

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "1.5rem" }}>Edit {chapter.name}</h1>

      <div className="contact-form" style={{ padding: "1.5rem" }}>
        <div className="card-grid">
          <div className="contact-form__field-group">
            <label className="contact-form__label">Chapter Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="contact-form__field"
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
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
            <label className="contact-form__label">External Website</label>
            <input
              type="url"
              value={externalWebsite}
              onChange={(e) => setExternalWebsite(e.target.value)}
              className="contact-form__field"
            />
          </div>
        </div>

        <div className="page-divider" style={{ margin: "1.5rem 0" }} />
        <p className="eyebrow" style={{ marginBottom: "1rem" }}>Regenerate AI Content (optional)</p>
        <div className="card-grid">
          <div className="contact-form__field-group">
            <label className="contact-form__label">Coach Names</label>
            <input
              type="text"
              value={coachNames}
              onChange={(e) => setCoachNames(e.target.value)}
              placeholder="Comma separated"
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Event Title</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Testimonial</label>
            <input
              type="text"
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              className="contact-form__field"
            />
          </div>
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "0.9rem", marginTop: "1rem" }}>{error}</p>}
        {success && <p style={{ color: "#16a34a", fontSize: "0.9rem", marginTop: "1rem" }}>Chapter updated successfully!</p>}

        <div className="stack-actions" style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={generating}
            className="button-secondary"
            style={{ opacity: generating ? 0.5 : 1 }}
          >
            {generating ? "Generating..." : "Regenerate AI Content"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="button-primary"
            style={{ opacity: saving ? 0.5 : 1 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {preview && <ChapterPreview content={preview} chapterName={name} />}
      </div>
    </div>
  );
}
