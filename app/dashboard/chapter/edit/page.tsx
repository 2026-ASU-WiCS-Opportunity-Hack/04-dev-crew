"use client";

import { useEffect, useState } from "react";

import { ChapterPreview } from "@/components/chapter/ChapterPreview";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import { getDefaultChapterContent, normalizeChapterContent } from "@/lib/chapter-content";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  ChapterContentSection,
  ChapterRecord,
  GeneratedChapterContent,
  ChapterGenerationInput,
} from "@/lib/types";

function navItemsToText(
  value: GeneratedChapterContent["local_nav_json"] = [],
) {
  return value.map((item) => `${item.label}|${item.href}`).join("\n");
}

function parseNavText(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part?.trim());
      return label && href ? { label, href } : null;
    })
    .filter(
      (item): item is { label: string; href: string } => Boolean(item),
    );
}

function moveSection(
  sections: ChapterContentSection[],
  index: number,
  direction: -1 | 1,
) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= sections.length) {
    return sections;
  }

  const nextSections = [...sections];
  const [current] = nextSections.splice(index, 1);
  nextSections.splice(nextIndex, 0, current);
  return nextSections;
}

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
  const [localNavText, setLocalNavText] = useState("");
  const [sections, setSections] = useState<ChapterContentSection[]>([]);
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
        const normalizedContent = normalizeChapterContent(chapterData);
        setPreview(normalizedContent);
        setLocalNavText(navItemsToText(normalizedContent.local_nav_json));
        setSections(normalizedContent.sections ?? []);
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
      const nextContent = {
        ...getDefaultChapterContent({
          ...chapter,
          name,
          language,
        }),
        ...(data.data?.content ?? data.content),
        local_nav_json: parseNavText(localNavText),
        sections,
      } as GeneratedChapterContent;
      setPreview(nextContent);
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
      const nextContent: GeneratedChapterContent = {
        ...(preview ?? getDefaultChapterContent(chapter)),
        hero_headline: preview?.hero_headline ?? name,
        hero_subheadline:
          preview?.hero_subheadline ??
          `Discover Action Learning programs in ${chapter.country}.`,
        about_section: preview?.about_section ?? "",
        why_action_learning: preview?.why_action_learning ?? [],
        coaches_intro: preview?.coaches_intro ?? "",
        event_highlight: preview?.event_highlight ?? "",
        testimonial_formatted: preview?.testimonial_formatted ?? "",
        cta_text: preview?.cta_text ?? "",
        meta_description: preview?.meta_description ?? "",
        local_nav_json: parseNavText(localNavText),
        sections,
      };

      const { error: updateError } = await supabase
        .from("chapters")
        .update({
          name,
          contact_name: contactName || null,
          contact_email: contactEmail || null,
          external_website: externalWebsite || null,
          language,
          content_json: nextContent,
        })
        .eq("id", chapter.id);

      if (updateError) throw updateError;
      setPreview(nextContent);
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
        <p className="eyebrow" style={{ marginBottom: "1rem" }}>Local Website Content</p>
        <div className="card-grid">
          <div className="contact-form__field-group">
            <label className="contact-form__label">Hero Headline</label>
            <input
              type="text"
              value={preview?.hero_headline ?? ""}
              onChange={(e) =>
                setPreview((current) => ({
                  ...(current ?? getDefaultChapterContent(chapter)),
                  hero_headline: e.target.value,
                }))
              }
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Hero Subheadline</label>
            <input
              type="text"
              value={preview?.hero_subheadline ?? ""}
              onChange={(e) =>
                setPreview((current) => ({
                  ...(current ?? getDefaultChapterContent(chapter)),
                  hero_subheadline: e.target.value,
                }))
              }
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
            <label className="contact-form__label">Local Navigation Items</label>
            <textarea
              value={localNavText}
              onChange={(e) => setLocalNavText(e.target.value)}
              className="contact-form__field"
              rows={4}
              placeholder={"Overview|#about\nPrograms|#events\nTeam|#coaches"}
            />
            <p className="form-hint">One item per line using Label|Href. Global navigation stays managed by the global admin.</p>
          </div>
        </div>

        <div className="page-divider" style={{ margin: "1.5rem 0" }} />
        <p className="eyebrow" style={{ marginBottom: "1rem" }}>Page Builder</p>
        <div style={{ display: "grid", gap: "1rem" }}>
          {sections.map((section, index) => (
            <div key={section.id} className="feature-card" style={{ display: "grid", gap: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center" }}>
                <strong>{section.title}</strong>
                <div className="stack-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setSections((current) => moveSection(current, index, -1))}
                  >
                    Move Up
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setSections((current) => moveSection(current, index, 1))}
                  >
                    Move Down
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() =>
                      setSections((current) => current.filter((item) => item.id !== section.id))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="card-grid">
                <div className="contact-form__field-group">
                  <label className="contact-form__label">Section Title</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      setSections((current) =>
                        current.map((item) =>
                          item.id === section.id ? { ...item, title: e.target.value } : item,
                        ),
                      )
                    }
                    className="contact-form__field"
                  />
                </div>
                <div className="contact-form__field-group">
                  <label className="contact-form__label">Section Type</label>
                  <input
                    type="text"
                    value={section.type}
                    className="contact-form__field"
                    disabled
                  />
                </div>
                <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="contact-form__label">Body</label>
                  <textarea
                    value={section.body ?? ""}
                    onChange={(e) =>
                      setSections((current) =>
                        current.map((item) =>
                          item.id === section.id ? { ...item, body: e.target.value } : item,
                        ),
                      )
                    }
                    className="contact-form__field"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="stack-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() =>
                setSections((current) => [
                  ...current,
                  {
                    id: `custom-${Date.now()}`,
                    type: "custom",
                    title: "New Section",
                    body: "",
                  },
                ])
              }
            >
              Add Custom Section
            </button>
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

        {preview && (
          <ChapterPreview
            content={{
              ...preview,
              local_nav_json: parseNavText(localNavText),
              sections,
            }}
            chapterName={name}
          />
        )}
      </div>
    </div>
  );
}
