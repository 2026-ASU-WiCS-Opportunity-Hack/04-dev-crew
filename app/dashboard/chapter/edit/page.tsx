"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ChapterPreview } from "@/components/chapter/ChapterPreview";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ChapterRecord, GeneratedChapterContent, ChapterGenerationInput } from "@/lib/types";

const EMPTY_CHAPTER_CONTENT: GeneratedChapterContent = {
  hero_headline: "",
  hero_subheadline: "",
  about_section: "",
  why_action_learning: ["", "", ""],
  coaches_intro: "",
  event_highlight: "",
  testimonial_formatted: "",
  cta_text: "",
  meta_description: "",
};

export default function EditChapterPage() {
  const router = useRouter();
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
  const { chapterId, orgRole } = useChapterDashboardContext();
  const isContentCreator = orgRole === "content_creator";

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
        setPreview(chapterData.content_json ?? EMPTY_CHAPTER_CONTENT);
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
      setPreview({
        ...EMPTY_CHAPTER_CONTENT,
        ...(data.data?.content ?? data.content),
      });
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
      const response = await fetch("/api/chapters/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapter.id,
          name,
          contactName: contactName || null,
          contactEmail: contactEmail || null,
          externalWebsite: externalWebsite || null,
          language,
          content: preview ?? EMPTY_CHAPTER_CONTENT,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Save failed");
      }

      if (!isContentCreator) {
        setChapter({
          ...chapter,
          name,
          contact_name: contactName || null,
          contact_email: contactEmail || null,
          external_website: externalWebsite || null,
          language,
          content_json: preview ?? EMPTY_CHAPTER_CONTENT,
        });
      } else {
        setChapter({
          ...chapter,
          content_json: preview ?? EMPTY_CHAPTER_CONTENT,
        });
      }

      router.refresh();
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapter) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned to your profile.</p>;

  const content = preview ?? EMPTY_CHAPTER_CONTENT;

  return (
    <div>
      <div style={{ display: "grid", gap: "0.4rem", marginBottom: "1.5rem" }}>
        <h1 className="section-title">Edit {chapter.name}</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>
          {isContentCreator
            ? "Update the approved content zones for your chapter page without changing structure or global branding."
            : "Manage chapter details and update the public-facing content for your chapter page."}
        </p>
      </div>

      <div className="contact-form" style={{ padding: "1.5rem" }}>
        {!isContentCreator && (
          <>
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
          </>
        )}

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

        <div className="page-divider" style={{ margin: "1.5rem 0" }} />
        <p className="eyebrow" style={{ marginBottom: "1rem" }}>Editable Content Zones</p>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Hero Headline</label>
          <input
            type="text"
            value={content.hero_headline}
            onChange={(e) => setPreview({ ...content, hero_headline: e.target.value })}
            className="contact-form__field"
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Hero Subheadline</label>
          <textarea
            value={content.hero_subheadline}
            onChange={(e) => setPreview({ ...content, hero_subheadline: e.target.value })}
            rows={3}
            className="contact-form__field"
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">About Section</label>
          <textarea
            value={content.about_section}
            onChange={(e) => setPreview({ ...content, about_section: e.target.value })}
            rows={5}
            className="contact-form__field"
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Why Action Learning</label>
          <textarea
            value={content.why_action_learning.filter(Boolean).join("\n")}
            onChange={(e) =>
              setPreview({
                ...content,
                why_action_learning: e.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            rows={4}
            placeholder="One point per line"
            className="contact-form__field"
          />
        </div>
        <div className="card-grid">
          <div className="contact-form__field-group">
            <label className="contact-form__label">Coaches Intro</label>
            <textarea
              value={content.coaches_intro}
              onChange={(e) => setPreview({ ...content, coaches_intro: e.target.value })}
              rows={4}
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Event Highlight</label>
            <textarea
              value={content.event_highlight}
              onChange={(e) => setPreview({ ...content, event_highlight: e.target.value })}
              rows={4}
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Testimonial Highlight</label>
            <textarea
              value={content.testimonial_formatted}
              onChange={(e) => setPreview({ ...content, testimonial_formatted: e.target.value })}
              rows={4}
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Call to Action</label>
            <input
              type="text"
              value={content.cta_text}
              onChange={(e) => setPreview({ ...content, cta_text: e.target.value })}
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
            <label className="contact-form__label">Meta Description</label>
            <textarea
              value={content.meta_description}
              onChange={(e) => setPreview({ ...content, meta_description: e.target.value })}
              rows={3}
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
