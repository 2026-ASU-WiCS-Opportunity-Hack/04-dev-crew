import type {
  ChapterContentSection,
  ChapterRecord,
  GeneratedChapterContent,
  NavItem,
} from "@/lib/types";

function slugifySectionId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

function sanitizeNavItems(value: unknown): NavItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const href =
        "href" in item && typeof item.href === "string" ? item.href.trim() : "";
      const label =
        "label" in item && typeof item.label === "string"
          ? item.label.trim()
          : "";

      if (!href || !label) {
        return null;
      }

      return { href, label };
    })
    .filter((item): item is NavItem => Boolean(item));
}

function createDefaultSections(
  chapter: ChapterRecord,
  content: GeneratedChapterContent,
): ChapterContentSection[] {
  return [
    {
      id: "about",
      type: "about",
      title: "About",
      body: content.about_section,
    },
    {
      id: "why-action-learning",
      type: "why_action_learning",
      title: "Why Action Learning?",
      items: content.why_action_learning,
    },
    {
      id: "coaches",
      type: "coaches",
      title: "Coaches",
      body: content.coaches_intro,
    },
    {
      id: "events",
      type: "events",
      title: "Upcoming Events",
      body: content.event_highlight,
    },
    {
      id: "testimonials",
      type: "testimonials",
      title: "Testimonials",
      body: content.testimonial_formatted,
    },
    {
      id: "contact",
      type: "cta",
      title: "Get in Touch",
      body: content.cta_text || `Connect with ${chapter.name} today.`,
    },
  ];
}

function sanitizeSections(
  value: unknown,
  fallback: ChapterContentSection[],
): ChapterContentSection[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const sections = value
    .map((section, index) => {
      if (!section || typeof section !== "object") {
        return null;
      }

      const title =
        "title" in section && typeof section.title === "string"
          ? section.title.trim()
          : "";

      const type =
        "type" in section && typeof section.type === "string"
          ? section.type
          : "custom";

      const body =
        "body" in section && typeof section.body === "string"
          ? section.body
          : "";

      const items =
        "items" in section && Array.isArray(section.items)
          ? (section.items as unknown[]).filter(
              (item: unknown): item is string =>
                typeof item === "string" && Boolean(item.trim()),
            )
          : undefined;

      if (!title) {
        return null;
      }

      const id =
        "id" in section && typeof section.id === "string" && section.id.trim()
          ? section.id.trim()
          : `${slugifySectionId(title)}-${index + 1}`;

      return {
        id,
        type:
          type === "about" ||
          type === "why_action_learning" ||
          type === "coaches" ||
          type === "events" ||
          type === "testimonials" ||
          type === "cta" ||
          type === "custom"
            ? type
            : "custom",
        title,
        body,
        items,
      } as ChapterContentSection;
    })
    .filter((section): section is ChapterContentSection => Boolean(section));

  return sections.length > 0 ? sections : fallback;
}

export function getDefaultChapterContent(chapter: ChapterRecord): GeneratedChapterContent {
  const defaultContent: GeneratedChapterContent = {
    hero_headline: chapter.name,
    hero_subheadline: `Discover Action Learning programs, certified coaches, and upcoming events in ${chapter.country}.`,
    about_section: `${chapter.name} is part of the global WIAL network, bringing Action Learning programs, certification pathways, and community leadership development to ${chapter.country}.`,
    why_action_learning: [
      "Develop leaders by solving real organizational challenges in small, structured groups.",
      "Build accountability and collaboration through practical, facilitated learning cycles.",
      "Create measurable impact with reflection, action, and peer coaching built into every session.",
    ],
    coaches_intro: `Meet the certified coaches serving ${chapter.country} through ${chapter.name}.`,
    event_highlight: `Explore workshops, certifications, and community events hosted by ${chapter.name}.`,
    testimonial_formatted: `Leaders across ${chapter.country} use Action Learning through ${chapter.name} to build stronger teams and deliver meaningful results.`,
    cta_text: `Ready to connect with ${chapter.name}? Reach out to learn more.`,
    meta_description: `Explore ${chapter.name} programs, coaches, and events in ${chapter.country}.`,
    local_nav_json: [],
    sections: [],
  };

  defaultContent.sections = createDefaultSections(chapter, defaultContent);
  return defaultContent;
}

export function normalizeChapterContent(
  chapter: ChapterRecord,
): GeneratedChapterContent {
  const defaults = getDefaultChapterContent(chapter);
  const raw = (chapter.content_json as Partial<GeneratedChapterContent> | null) ?? {};

  const merged: GeneratedChapterContent = {
    ...defaults,
    ...raw,
    hero_headline: raw.hero_headline?.trim() || defaults.hero_headline,
    hero_subheadline: raw.hero_subheadline?.trim() || defaults.hero_subheadline,
    about_section: raw.about_section?.trim() || defaults.about_section,
    why_action_learning:
      Array.isArray(raw.why_action_learning) && raw.why_action_learning.length > 0
        ? raw.why_action_learning.filter(Boolean)
        : defaults.why_action_learning,
    coaches_intro: raw.coaches_intro?.trim() || defaults.coaches_intro,
    event_highlight: raw.event_highlight?.trim() || defaults.event_highlight,
    testimonial_formatted:
      raw.testimonial_formatted?.trim() || defaults.testimonial_formatted,
    cta_text: raw.cta_text?.trim() || defaults.cta_text,
    meta_description: raw.meta_description?.trim() || defaults.meta_description,
    local_nav_json: sanitizeNavItems(raw.local_nav_json),
  };

  const defaultSections = createDefaultSections(chapter, merged);
  merged.sections = sanitizeSections(raw.sections, defaultSections);

  return merged;
}
