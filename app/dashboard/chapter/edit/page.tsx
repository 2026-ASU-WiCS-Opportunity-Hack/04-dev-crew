"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ChapterPreview } from "@/components/chapter/ChapterPreview";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import { normalizeChapterContent } from "@/lib/chapter-content";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  ChapterContentSection,
  ChapterRecord,
  ChapterSectionType,
  ChapterWebsitePage,
  GeneratedChapterContent,
  ChapterGenerationInput,
} from "@/lib/types";
import { slugify } from "@/lib/utils";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [current] = next.splice(index, 1);
  next.splice(nextIndex, 0, current);
  return next;
}

function isValidActionUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return true;
  }

  if (/^(mailto:|tel:)/i.test(trimmed)) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function buildUniquePageSlug(
  pages: ChapterWebsitePage[],
  name: string,
  currentPageId?: string,
  isHome?: boolean,
) {
  if (isHome) {
    return "";
  }

  const base = slugify(name) || "page";
  const used = new Set(
    pages
      .filter((page) => page.id !== currentPageId && !page.is_home)
      .map((page) => page.slug),
  );
  let candidate = base;
  let counter = 2;

  while (used.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function createSection(type: ChapterSectionType): ChapterContentSection {
  if (type === "hero") {
    return {
      id: createId("hero"),
      type,
      content: {
        title: "New hero title",
        subtitle: "Add a strong supporting message for this page.",
        background_image_url: "",
        action: { text: "Learn more", url: "" },
      },
    };
  }

  if (type === "about") {
    return {
      id: createId("about"),
      type,
      content: {
        title: "About this page",
        paragraph: "Add a concise explanation for this section.",
      },
    };
  }

  if (type === "features") {
    return {
      id: createId("features"),
      type,
      content: {
        title: "Highlights",
        cards: [
          {
            id: createId("feature"),
            title: "Feature title",
            description: "Describe the value of this feature or service.",
            icon: "✦",
          },
        ],
      },
    };
  }

  if (type === "events") {
    return {
      id: createId("events"),
      type,
      content: {
        title: "Events",
        items: [
          {
            id: createId("event"),
            title: "Event title",
            date: "",
            description: "Add the event details here.",
            action: { text: "Register", url: "" },
          },
        ],
      },
    };
  }

  if (type === "testimonials") {
    return {
      id: createId("testimonials"),
      type,
      content: {
        title: "Testimonials",
        items: [
          {
            id: createId("testimonial"),
            quote: "Share a strong quote from a participant or client.",
            author: "Name",
          },
        ],
      },
    };
  }

  return {
    id: createId("cta"),
    type: "cta",
    content: {
      message: "Invite visitors to take the next step.",
      action: { text: "Get in touch", url: "" },
    },
  };
}

function createPage(pages: ChapterWebsitePage[]): ChapterWebsitePage {
  const name = `Page ${pages.length + 1}`;
  return {
    id: createId("page"),
    name,
    slug: buildUniquePageSlug(pages, name),
    is_home: false,
    show_in_nav: true,
    nav_label: name,
    sections: [createSection("hero"), createSection("about")],
  };
}

function applyGeneratedContent(
  current: GeneratedChapterContent,
  generated: GeneratedChapterContent,
): GeneratedChapterContent {
  const pages = (current.pages ?? []).map((page, index) => {
    if (!(page.is_home || index === 0)) {
      return page;
    }

    const sections = page.sections.map((section) => {
      if (section.type === "hero") {
        return {
          ...section,
          content: {
            ...section.content,
            title: generated.hero_headline || section.content.title,
            subtitle: generated.hero_subheadline || section.content.subtitle,
          },
        };
      }

      if (section.type === "about") {
        return {
          ...section,
          content: {
            ...section.content,
            paragraph: generated.about_section || section.content.paragraph,
          },
        };
      }

      if (section.type === "features" && generated.why_action_learning.length > 0) {
        return {
          ...section,
          content: {
            ...section.content,
            cards: generated.why_action_learning.map((item, cardIndex) => ({
              id: section.content.cards[cardIndex]?.id ?? createId("feature"),
              title: section.content.cards[cardIndex]?.title ?? `Feature ${cardIndex + 1}`,
              description: item,
              icon: section.content.cards[cardIndex]?.icon ?? "",
            })),
          },
        };
      }

      if (section.type === "events" && generated.event_highlight) {
        const first = section.content.items[0];
        return {
          ...section,
          content: {
            ...section.content,
            items: [
              {
                id: first?.id ?? createId("event"),
                title: first?.title ?? "Featured Event",
                date: first?.date ?? "",
                description: generated.event_highlight,
                action: first?.action ?? { text: "Register", url: "" },
              },
              ...section.content.items.slice(1),
            ],
          },
        };
      }

      if (section.type === "testimonials" && generated.testimonial_formatted) {
        const first = section.content.items[0];
        return {
          ...section,
          content: {
            ...section.content,
            items: [
              {
                id: first?.id ?? createId("testimonial"),
                quote: generated.testimonial_formatted,
                author: first?.author ?? "WIAL Community Member",
              },
              ...section.content.items.slice(1),
            ],
          },
        };
      }

      if (section.type === "cta" && generated.cta_text) {
        return {
          ...section,
          content: {
            ...section.content,
            message: generated.cta_text,
          },
        };
      }

      return section;
    });

    return {
      ...page,
      sections,
    };
  });

  return {
    ...current,
    ...generated,
    pages,
    meta_description: generated.meta_description || current.meta_description,
  };
}

function collectInvalidUrls(content: GeneratedChapterContent) {
  const invalid: string[] = [];

  for (const page of content.pages ?? []) {
    for (const section of page.sections) {
      if (section.type === "hero" || section.type === "cta") {
        const action = section.content.action;
        if (action?.url && !isValidActionUrl(action.url)) {
          invalid.push(`${page.name}: ${section.type} button URL is invalid.`);
        }
      }

      if (section.type === "events") {
        section.content.items.forEach((item) => {
          if (item.action?.url && !isValidActionUrl(item.action.url)) {
            invalid.push(`${page.name}: event link for "${item.title || "Untitled event"}" is invalid.`);
          }
        });
      }
    }
  }

  return invalid;
}

function SectionTypeButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="button-secondary" onClick={onClick}>
      Add {label}
    </button>
  );
}

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
  const [draftContent, setDraftContent] = useState<GeneratedChapterContent | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { chapterId } = useChapterDashboardContext();

  useEffect(() => {
    async function load() {
      if (!chapterId) {
        setLoading(false);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();

      const chapterData = data as ChapterRecord | null;
      if (chapterData) {
        const normalizedContent = normalizeChapterContent(chapterData);
        setChapter(chapterData);
        setName(chapterData.name);
        setContactName(chapterData.contact_name ?? "");
        setContactEmail(chapterData.contact_email ?? "");
        setExternalWebsite(chapterData.external_website ?? "");
        setLanguage(chapterData.language);
        setDraftContent(normalizedContent);
        setSelectedPageId(normalizedContent.pages?.[0]?.id ?? "");
      }

      setLoading(false);
    }

    load();
  }, [chapterId]);

  const pages = draftContent?.pages ?? [];
  const selectedPage =
    pages.find((page) => page.id === selectedPageId) ?? pages[0] ?? null;
  const selectedPageSlug = selectedPage?.is_home ? "" : selectedPage?.slug;
  const invalidUrls = useMemo(
    () => (draftContent ? collectInvalidUrls(draftContent) : []),
    [draftContent],
  );

  function updateDraft(mutator: (current: GeneratedChapterContent) => GeneratedChapterContent) {
    setDraftContent((current) => {
      if (!current) {
        return current;
      }
      return mutator(current);
    });
  }

  function updateSelectedPage(
    mutator: (page: ChapterWebsitePage, pages: ChapterWebsitePage[]) => ChapterWebsitePage,
  ) {
    updateDraft((current) => ({
      ...current,
      pages: (current.pages ?? []).map((page) =>
        page.id === selectedPage?.id ? mutator(page, current.pages ?? []) : page,
      ),
    }));
  }

  function normalizeCurrentContent(content: GeneratedChapterContent) {
    if (!chapter) {
      return content;
    }

    return normalizeChapterContent({
      ...chapter,
      name,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      external_website: externalWebsite || null,
      language,
      content_json: content,
    });
  }

  async function handleRegenerate() {
    if (!chapter || !draftContent) {
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const input: ChapterGenerationInput = {
        chapterName: name,
        country: chapter.country,
        language,
        contactName: contactName || undefined,
        coachNames: coachNames ? coachNames.split(",").map((item) => item.trim()) : undefined,
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
      const generated = data.data?.content ?? data.content;
      const next = normalizeCurrentContent(applyGeneratedContent(draftContent, generated));
      setDraftContent(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!chapter || !draftContent) {
      return;
    }

    if (invalidUrls.length > 0) {
      setError(invalidUrls[0]);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const normalized = normalizeCurrentContent(draftContent);
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
          content: normalized,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Save failed");
      }

      setDraftContent(normalized);
      setChapter({
        ...chapter,
        name,
        contact_name: contactName || null,
        contact_email: contactEmail || null,
        external_website: externalWebsite || null,
        language,
        content_json: normalized,
      });
      router.refresh();
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  }

  if (!chapter || !draftContent || !selectedPage) {
    return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned to your profile.</p>;
  }

  return (
    <div>
      <div style={{ display: "grid", gap: "0.4rem", marginBottom: "1.5rem" }}>
        <h1 className="section-title">Edit {chapter.name}</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>
          Build multi-page chapter websites with reusable sections, locked global styling, and live preview.
        </p>
      </div>

      <div className="contact-form" style={{ padding: "1.5rem" }}>
        <div className="card-grid">
          <div className="contact-form__field-group">
            <label className="contact-form__label">Chapter Name</label>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="contact-form__field" />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Language</label>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="contact-form__field">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="pt">Portuguese</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Contact Name</label>
            <input type="text" value={contactName} onChange={(event) => setContactName(event.target.value)} className="contact-form__field" />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Contact Email</label>
            <input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} className="contact-form__field" />
          </div>
          <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
            <label className="contact-form__label">External Website</label>
            <input type="url" value={externalWebsite} onChange={(event) => setExternalWebsite(event.target.value)} className="contact-form__field" />
          </div>
        </div>

        <div className="page-divider" style={{ margin: "1.5rem 0" }} />

        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: "0.35rem" }}>Page Management</p>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
                Global navigation stays locked. Chapter menu items are generated from the pages below.
              </p>
            </div>
            <button
              type="button"
              className="button-primary"
              onClick={() =>
                updateDraft((current) => {
                  const nextPage = createPage(current.pages ?? []);
                  setSelectedPageId(nextPage.id);
                  return {
                    ...current,
                    pages: [...(current.pages ?? []), nextPage],
                  };
                })
              }
            >
              Add New Page
            </button>
          </div>

          <div style={{ display: "grid", gap: "0.75rem" }}>
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                className="feature-card"
                onClick={() => setSelectedPageId(page.id)}
                style={{
                  textAlign: "left",
                  border: page.id === selectedPage.id ? "2px solid var(--brand)" : "1px solid rgba(0,0,0,0.08)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
                  <div>
                    <strong>{page.name}</strong>
                    <p style={{ margin: "0.35rem 0 0", color: "var(--muted)", fontSize: "0.88rem" }}>
                      Route: {page.is_home ? `/${chapter.slug}` : `/${chapter.slug}/${page.slug}`}
                    </p>
                  </div>
                  <span className="badge">{page.is_home ? "Home" : "Page"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="page-divider" style={{ margin: "1.5rem 0" }} />

        <p className="eyebrow" style={{ marginBottom: "1rem" }}>Selected Page</p>
        <div className="card-grid">
          <div className="contact-form__field-group">
            <label className="contact-form__label">Page Name</label>
            <input
              type="text"
              value={selectedPage.name}
              onChange={(event) =>
                updateSelectedPage((page, allPages) => {
                  const newName = event.target.value;
                  const nextSlug = buildUniquePageSlug(allPages, newName, page.id, page.is_home);
                  return {
                    ...page,
                    name: newName,
                    slug: nextSlug,
                    nav_label: !page.nav_label || page.nav_label === page.name ? newName : page.nav_label,
                  };
                })
              }
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Generated Route</label>
            <input
              type="text"
              value={selectedPage.is_home ? `/${chapter.slug}` : `/${chapter.slug}/${selectedPage.slug}`}
              className="contact-form__field"
              disabled
            />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Menu Label</label>
            <input
              type="text"
              value={selectedPage.nav_label ?? ""}
              onChange={(event) =>
                updateSelectedPage((page) => ({
                  ...page,
                  nav_label: event.target.value,
                }))
              }
              className="contact-form__field"
            />
          </div>
          <div className="contact-form__field-group" style={{ alignSelf: "end" }}>
            <label className="contact-form__label" style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <input
                checked={Boolean(selectedPage.show_in_nav)}
                onChange={(event) =>
                  updateSelectedPage((page) => ({
                    ...page,
                    show_in_nav: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Show in chapter menu
            </label>
          </div>
        </div>

        <div className="stack-actions" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="button-secondary"
            disabled={pages.length <= 1}
            onClick={() =>
              updateDraft((current) => {
                const remaining = (current.pages ?? []).filter((page) => page.id !== selectedPage.id);
                const nextPages =
                  remaining.length === 0
                    ? current.pages ?? []
                    : remaining.map((page, index) => ({
                        ...page,
                        is_home: index === 0 ? true : page.is_home && !selectedPage.is_home,
                        slug: index === 0 ? "" : page.slug,
                      }));
                setSelectedPageId(nextPages[0]?.id ?? "");
                return {
                  ...current,
                  pages: nextPages,
                };
              })
            }
            style={{ opacity: pages.length <= 1 ? 0.5 : 1 }}
          >
            Delete Page
          </button>
        </div>

        <div className="page-divider" style={{ margin: "1.5rem 0" }} />

        <div style={{ display: "grid", gap: "1rem" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.35rem" }}>Section Builder</p>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
              Sections inherit the global template styling. Fonts, colors, and global navigation cannot be changed here.
            </p>
          </div>

          <div className="stack-actions">
            <SectionTypeButton label="Hero" onClick={() => updateSelectedPage((page) => ({ ...page, sections: [...page.sections, createSection("hero")] }))} />
            <SectionTypeButton label="About" onClick={() => updateSelectedPage((page) => ({ ...page, sections: [...page.sections, createSection("about")] }))} />
            <SectionTypeButton label="Features" onClick={() => updateSelectedPage((page) => ({ ...page, sections: [...page.sections, createSection("features")] }))} />
            <SectionTypeButton label="Events" onClick={() => updateSelectedPage((page) => ({ ...page, sections: [...page.sections, createSection("events")] }))} />
            <SectionTypeButton label="Testimonials" onClick={() => updateSelectedPage((page) => ({ ...page, sections: [...page.sections, createSection("testimonials")] }))} />
            <SectionTypeButton label="CTA" onClick={() => updateSelectedPage((page) => ({ ...page, sections: [...page.sections, createSection("cta")] }))} />
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            {selectedPage.sections.map((section, sectionIndex) => (
              <div key={section.id} className="feature-card" style={{ display: "grid", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <strong style={{ textTransform: "capitalize" }}>{section.type} section</strong>
                  <div className="stack-actions">
                    <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: moveItem(page.sections, sectionIndex, -1) }))}>Move Up</button>
                    <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: moveItem(page.sections, sectionIndex, 1) }))}>Move Down</button>
                    <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.filter((item) => item.id !== section.id) }))}>Remove</button>
                  </div>
                </div>

                {section.type === "hero" ? (
                  <div className="card-grid">
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Headline</label>
                      <input type="text" value={section.content.title} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "hero" ? { ...item, content: { ...item.content, title: event.target.value } } : item) }))} className="contact-form__field" />
                    </div>
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Subheading</label>
                      <input type="text" value={section.content.subtitle} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "hero" ? { ...item, content: { ...item.content, subtitle: event.target.value } } : item) }))} className="contact-form__field" />
                    </div>
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Banner / Background Image URL</label>
                      <input type="url" value={section.content.background_image_url ?? ""} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "hero" ? { ...item, content: { ...item.content, background_image_url: event.target.value } } : item) }))} className="contact-form__field" />
                    </div>
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Button Text</label>
                      <input type="text" value={section.content.action?.text ?? ""} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "hero" ? { ...item, content: { ...item.content, action: { text: event.target.value, url: item.content.action?.url ?? "" } } } : item) }))} className="contact-form__field" />
                    </div>
                    <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="contact-form__label">Button URL</label>
                      <input type="url" value={section.content.action?.url ?? ""} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "hero" ? { ...item, content: { ...item.content, action: { text: item.content.action?.text ?? "", url: event.target.value } } } : item) }))} className="contact-form__field" />
                      {section.content.action?.url && !isValidActionUrl(section.content.action.url) ? <p className="form-hint" style={{ color: "#dc2626" }}>Enter a valid URL, mailto link, phone link, root-relative path, or page anchor.</p> : null}
                    </div>
                  </div>
                ) : null}

                {section.type === "about" ? (
                  <div className="card-grid">
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Title</label>
                      <input type="text" value={section.content.title} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "about" ? { ...item, content: { ...item.content, title: event.target.value } } : item) }))} className="contact-form__field" />
                    </div>
                    <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="contact-form__label">Paragraph</label>
                      <textarea value={section.content.paragraph} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "about" ? { ...item, content: { ...item.content, paragraph: event.target.value } } : item) }))} className="contact-form__field" rows={5} />
                    </div>
                  </div>
                ) : null}

                {section.type === "features" ? (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Section Title</label>
                      <input type="text" value={section.content.title} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "features" ? { ...item, content: { ...item.content, title: event.target.value } } : item) }))} className="contact-form__field" />
                    </div>
                    {section.content.cards.map((card, cardIndex) => (
                      <div key={card.id} className="feature-card" style={{ display: "grid", gap: "0.75rem" }}>
                        <div className="stack-actions">
                          <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "features" ? { ...item, content: { ...item.content, cards: moveItem(item.content.cards, cardIndex, -1) } } : item) }))}>Move Up</button>
                          <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "features" ? { ...item, content: { ...item.content, cards: moveItem(item.content.cards, cardIndex, 1) } } : item) }))}>Move Down</button>
                          <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "features" ? { ...item, content: { ...item.content, cards: item.content.cards.filter((entry) => entry.id !== card.id) } } : item) }))}>Remove Card</button>
                        </div>
                        <div className="card-grid">
                          <div className="contact-form__field-group">
                            <label className="contact-form__label">Card Title</label>
                            <input type="text" value={card.title} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "features" ? { ...item, content: { ...item.content, cards: item.content.cards.map((entry) => entry.id === card.id ? { ...entry, title: event.target.value } : entry) } } : item) }))} className="contact-form__field" />
                          </div>
                          <div className="contact-form__field-group">
                            <label className="contact-form__label">Icon</label>
                            <input type="text" value={card.icon ?? ""} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "features" ? { ...item, content: { ...item.content, cards: item.content.cards.map((entry) => entry.id === card.id ? { ...entry, icon: event.target.value } : entry) } } : item) }))} className="contact-form__field" placeholder="✦" />
                          </div>
                          <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
                            <label className="contact-form__label">Description</label>
                            <textarea value={card.description} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "features" ? { ...item, content: { ...item.content, cards: item.content.cards.map((entry) => entry.id === card.id ? { ...entry, description: event.target.value } : entry) } } : item) }))} className="contact-form__field" rows={3} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "features" ? { ...item, content: { ...item.content, cards: [...item.content.cards, { id: createId("feature"), title: "Feature title", description: "", icon: "" }] } } : item) }))}>Add Card</button>
                  </div>
                ) : null}

                {section.type === "events" ? (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Section Title</label>
                      <input type="text" value={section.content.title} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "events" ? { ...item, content: { ...item.content, title: event.target.value } } : item) }))} className="contact-form__field" />
                    </div>
                    {section.content.items.map((item, itemIndex) => (
                      <div key={item.id} className="feature-card" style={{ display: "grid", gap: "0.75rem" }}>
                        <div className="stack-actions">
                          <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "events" ? { ...sectionItem, content: { ...sectionItem.content, items: moveItem(sectionItem.content.items, itemIndex, -1) } } : sectionItem) }))}>Move Up</button>
                          <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "events" ? { ...sectionItem, content: { ...sectionItem.content, items: moveItem(sectionItem.content.items, itemIndex, 1) } } : sectionItem) }))}>Move Down</button>
                          <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "events" ? { ...sectionItem, content: { ...sectionItem.content, items: sectionItem.content.items.filter((entry) => entry.id !== item.id) } } : sectionItem) }))}>Remove Event</button>
                        </div>
                        <div className="card-grid">
                          <div className="contact-form__field-group">
                            <label className="contact-form__label">Event Title</label>
                            <input type="text" value={item.title} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "events" ? { ...sectionItem, content: { ...sectionItem.content, items: sectionItem.content.items.map((entry) => entry.id === item.id ? { ...entry, title: event.target.value } : entry) } } : sectionItem) }))} className="contact-form__field" />
                          </div>
                          <div className="contact-form__field-group">
                            <label className="contact-form__label">Date</label>
                            <input type="text" value={item.date ?? ""} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "events" ? { ...sectionItem, content: { ...sectionItem.content, items: sectionItem.content.items.map((entry) => entry.id === item.id ? { ...entry, date: event.target.value } : entry) } } : sectionItem) }))} className="contact-form__field" placeholder="April 10, 2026" />
                          </div>
                          <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
                            <label className="contact-form__label">Description</label>
                            <textarea value={item.description} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "events" ? { ...sectionItem, content: { ...sectionItem.content, items: sectionItem.content.items.map((entry) => entry.id === item.id ? { ...entry, description: event.target.value } : entry) } } : sectionItem) }))} className="contact-form__field" rows={3} />
                          </div>
                          <div className="contact-form__field-group">
                            <label className="contact-form__label">Button Text</label>
                            <input type="text" value={item.action?.text ?? ""} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "events" ? { ...sectionItem, content: { ...sectionItem.content, items: sectionItem.content.items.map((entry) => entry.id === item.id ? { ...entry, action: { text: event.target.value, url: entry.action?.url ?? "" } } : entry) } } : sectionItem) }))} className="contact-form__field" />
                          </div>
                          <div className="contact-form__field-group">
                            <label className="contact-form__label">Button URL</label>
                            <input type="url" value={item.action?.url ?? ""} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "events" ? { ...sectionItem, content: { ...sectionItem.content, items: sectionItem.content.items.map((entry) => entry.id === item.id ? { ...entry, action: { text: entry.action?.text ?? "", url: event.target.value } } : entry) } } : sectionItem) }))} className="contact-form__field" />
                            {item.action?.url && !isValidActionUrl(item.action.url) ? <p className="form-hint" style={{ color: "#dc2626" }}>Enter a valid event link.</p> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "events" ? { ...item, content: { ...item.content, items: [...item.content.items, { id: createId("event"), title: "Event title", date: "", description: "", action: { text: "Register", url: "" } }] } } : item) }))}>Add Event</button>
                  </div>
                ) : null}

                {section.type === "testimonials" ? (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Section Title</label>
                      <input type="text" value={section.content.title} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "testimonials" ? { ...item, content: { ...item.content, title: event.target.value } } : item) }))} className="contact-form__field" />
                    </div>
                    {section.content.items.map((item, itemIndex) => (
                      <div key={item.id} className="feature-card" style={{ display: "grid", gap: "0.75rem" }}>
                        <div className="stack-actions">
                          <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "testimonials" ? { ...sectionItem, content: { ...sectionItem.content, items: moveItem(sectionItem.content.items, itemIndex, -1) } } : sectionItem) }))}>Move Up</button>
                          <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "testimonials" ? { ...sectionItem, content: { ...sectionItem.content, items: moveItem(sectionItem.content.items, itemIndex, 1) } } : sectionItem) }))}>Move Down</button>
                          <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "testimonials" ? { ...sectionItem, content: { ...sectionItem.content, items: sectionItem.content.items.filter((entry) => entry.id !== item.id) } } : sectionItem) }))}>Remove Quote</button>
                        </div>
                        <div className="card-grid">
                          <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
                            <label className="contact-form__label">Quote</label>
                            <textarea value={item.quote} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "testimonials" ? { ...sectionItem, content: { ...sectionItem.content, items: sectionItem.content.items.map((entry) => entry.id === item.id ? { ...entry, quote: event.target.value } : entry) } } : sectionItem) }))} className="contact-form__field" rows={3} />
                          </div>
                          <div className="contact-form__field-group">
                            <label className="contact-form__label">Author</label>
                            <input type="text" value={item.author} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((sectionItem) => sectionItem.id === section.id && sectionItem.type === "testimonials" ? { ...sectionItem, content: { ...sectionItem.content, items: sectionItem.content.items.map((entry) => entry.id === item.id ? { ...entry, author: event.target.value } : entry) } } : sectionItem) }))} className="contact-form__field" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="button-secondary" onClick={() => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "testimonials" ? { ...item, content: { ...item.content, items: [...item.content.items, { id: createId("testimonial"), quote: "", author: "" }] } } : item) }))}>Add Quote</button>
                  </div>
                ) : null}

                {section.type === "cta" ? (
                  <div className="card-grid">
                    <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="contact-form__label">Message</label>
                      <textarea value={section.content.message} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "cta" ? { ...item, content: { ...item.content, message: event.target.value } } : item) }))} className="contact-form__field" rows={3} />
                    </div>
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Button Text</label>
                      <input type="text" value={section.content.action?.text ?? ""} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "cta" ? { ...item, content: { ...item.content, action: { text: event.target.value, url: item.content.action?.url ?? "" } } } : item) }))} className="contact-form__field" />
                    </div>
                    <div className="contact-form__field-group">
                      <label className="contact-form__label">Button URL</label>
                      <input type="url" value={section.content.action?.url ?? ""} onChange={(event) => updateSelectedPage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id && item.type === "cta" ? { ...item, content: { ...item.content, action: { text: item.content.action?.text ?? "", url: event.target.value } } } : item) }))} className="contact-form__field" />
                      {section.content.action?.url && !isValidActionUrl(section.content.action.url) ? <p className="form-hint" style={{ color: "#dc2626" }}>Enter a valid URL for this CTA.</p> : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="page-divider" style={{ margin: "1.5rem 0" }} />

        <p className="eyebrow" style={{ marginBottom: "1rem" }}>AI Content Refresh (optional)</p>
        <div className="card-grid">
          <div className="contact-form__field-group">
            <label className="contact-form__label">Coach Names</label>
            <input type="text" value={coachNames} onChange={(event) => setCoachNames(event.target.value)} placeholder="Comma separated" className="contact-form__field" />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Event Title</label>
            <input type="text" value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} className="contact-form__field" />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Event Date</label>
            <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className="contact-form__field" />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Testimonial</label>
            <input type="text" value={testimonial} onChange={(event) => setTestimonial(event.target.value)} className="contact-form__field" />
          </div>
        </div>

        {invalidUrls.length > 0 ? (
          <div style={{ marginTop: "1rem", display: "grid", gap: "0.35rem" }}>
            {invalidUrls.map((message) => (
              <p key={message} style={{ color: "#dc2626", fontSize: "0.88rem", margin: 0 }}>
                {message}
              </p>
            ))}
          </div>
        ) : null}

        {error ? <p style={{ color: "#dc2626", fontSize: "0.9rem", marginTop: "1rem" }}>{error}</p> : null}
        {success ? <p style={{ color: "#16a34a", fontSize: "0.9rem", marginTop: "1rem" }}>Chapter updated successfully!</p> : null}

        <div className="stack-actions" style={{ marginTop: "1.5rem" }}>
          <button type="button" onClick={handleRegenerate} disabled={generating} className="button-secondary" style={{ opacity: generating ? 0.5 : 1 }}>
            {generating ? "Generating..." : "Regenerate AI Content"}
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="button-primary" style={{ opacity: saving ? 0.5 : 1 }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="page-divider" style={{ margin: "1.5rem 0" }} />

        <ChapterPreview content={draftContent} chapterName={name} activePageSlug={selectedPageSlug} />
      </div>
    </div>
  );
}
