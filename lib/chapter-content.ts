import { slugify } from "@/lib/utils";
import type {
  AboutSectionContent,
  ChapterContentSection,
  ChapterRecord,
  ChapterSectionAction,
  ChapterSectionType,
  ChapterWebsitePage,
  CtaSectionContent,
  EventItemContent,
  EventsSectionContent,
  FeatureCardContent,
  FeaturesSectionContent,
  GeneratedChapterContent,
  HeroSectionContent,
  NavItem,
  TestimonialItemContent,
  TestimonialsSectionContent,
} from "@/lib/types";

function sanitizeText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function uniqueSlug(base: string, used: Set<string>, fallback: string) {
  const root = slugify(base) || fallback;
  let candidate = root;
  let counter = 2;

  while (used.has(candidate)) {
    candidate = `${root}-${counter}`;
    counter += 1;
  }

  used.add(candidate);
  return candidate;
}

function sanitizeAction(value: unknown): ChapterSectionAction | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const text =
    "text" in value && typeof value.text === "string" ? value.text.trim() : "";
  const url =
    "url" in value && typeof value.url === "string" ? value.url.trim() : "";

  if (!text && !url) {
    return null;
  }

  return {
    text,
    url,
  };
}

function createHeroSection(
  title: string,
  subtitle: string,
  action?: ChapterSectionAction | null,
): ChapterContentSection {
  const content: HeroSectionContent = {
    title,
    subtitle,
    background_image_url: "",
    action: action ?? null,
  };

  return {
    id: createId("hero"),
    type: "hero",
    content,
  };
}

function createAboutSection(title: string, paragraph: string): ChapterContentSection {
  const content: AboutSectionContent = {
    title,
    paragraph,
  };

  return {
    id: createId("about"),
    type: "about",
    content,
  };
}

function createFeaturesSection(items: string[]): ChapterContentSection {
  const cards: FeatureCardContent[] = items.map((item, index) => ({
    id: createId(`feature-${index + 1}`),
    title: `Feature ${index + 1}`,
    description: item,
    icon: "",
  }));

  const content: FeaturesSectionContent = {
    title: "Why Action Learning",
    cards,
  };

  return {
    id: createId("features"),
    type: "features",
    content,
  };
}

function createEventsSection(highlight: string): ChapterContentSection {
  const items: EventItemContent[] = highlight
    ? [
        {
          id: createId("event"),
          title: "Featured Event",
          date: "",
          description: highlight,
          action: null,
        },
      ]
    : [];

  const content: EventsSectionContent = {
    title: "Events",
    items,
  };

  return {
    id: createId("events"),
    type: "events",
    content,
  };
}

function createTestimonialsSection(testimonial: string): ChapterContentSection {
  const items: TestimonialItemContent[] = testimonial
    ? [
        {
          id: createId("testimonial"),
          quote: testimonial,
          author: "WIAL Community Member",
        },
      ]
    : [];

  const content: TestimonialsSectionContent = {
    title: "Testimonials",
    items,
  };

  return {
    id: createId("testimonials"),
    type: "testimonials",
    content,
  };
}

function createCtaSection(message: string, email?: string | null): ChapterContentSection {
  const content: CtaSectionContent = {
    message,
    action: email
      ? {
          text: "Contact Us",
          url: `mailto:${email}`,
        }
      : null,
  };

  return {
    id: createId("cta"),
    type: "cta",
    content,
  };
}

function createDefaultPages(
  chapter: ChapterRecord,
  content: GeneratedChapterContent,
): ChapterWebsitePage[] {
  return [
    {
      id: "page-home",
      name: "Home",
      slug: "",
      is_home: true,
      show_in_nav: false,
      nav_label: "Home",
      sections: [
        createHeroSection(content.hero_headline, content.hero_subheadline, {
          text: "Learn more",
          url: chapter.external_website || "/contact",
        }),
        createAboutSection("About", content.about_section),
        createFeaturesSection(content.why_action_learning),
        createEventsSection(content.event_highlight),
        createTestimonialsSection(content.testimonial_formatted),
        createCtaSection(content.cta_text, chapter.contact_email),
      ],
    },
  ];
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

function normalizeFeatureCards(value: unknown): FeatureCardContent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const cards: FeatureCardContent[] = [];

  value.forEach((card, index) => {
    if (!card || typeof card !== "object") {
      return;
    }

    const title =
      "title" in card && typeof card.title === "string"
        ? card.title.trim()
        : `Feature ${index + 1}`;
    const description =
      "description" in card && typeof card.description === "string"
        ? card.description.trim()
        : "";
    const icon =
      "icon" in card && typeof card.icon === "string" ? card.icon.trim() : "";

    if (!description && !title) {
      return;
    }

    cards.push({
      id:
        "id" in card && typeof card.id === "string" && card.id.trim()
          ? card.id.trim()
          : createId("feature"),
      title,
      description,
      icon,
    });
  });

  return cards;
}

function normalizeEventItems(value: unknown): EventItemContent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: EventItemContent[] = [];

  value.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const title =
      "title" in item && typeof item.title === "string" ? item.title.trim() : "";
    const date =
      "date" in item && typeof item.date === "string" ? item.date.trim() : "";
    const description =
      "description" in item && typeof item.description === "string"
        ? item.description.trim()
        : "";

    if (!title && !description) {
      return;
    }

    items.push({
      id:
        "id" in item && typeof item.id === "string" && item.id.trim()
          ? item.id.trim()
          : createId("event"),
      title,
      date,
      description,
      action: sanitizeAction("action" in item ? item.action : null),
    });
  });

  return items;
}

function normalizeTestimonials(value: unknown): TestimonialItemContent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const quote =
        "quote" in item && typeof item.quote === "string" ? item.quote.trim() : "";
      const author =
        "author" in item && typeof item.author === "string"
          ? item.author.trim()
          : "";

      if (!quote) {
        return null;
      }

      return {
        id:
          "id" in item && typeof item.id === "string" && item.id.trim()
            ? item.id.trim()
            : createId("testimonial"),
        quote,
        author,
      };
    })
    .filter((item): item is TestimonialItemContent => Boolean(item));
}

function normalizeSection(
  value: unknown,
  fallback: ChapterContentSection,
): ChapterContentSection {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const type =
    "type" in value && typeof value.type === "string"
      ? value.type
      : fallback.type;
  const id =
    "id" in value && typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : fallback.id;
  const rawContent = "content" in value ? value.content : null;

  if (type === "hero") {
    const base = fallback.type === "hero" ? fallback.content : { title: "", subtitle: "" };
    return {
      id,
      type,
      content: {
        title:
          rawContent && typeof rawContent === "object" && "title" in rawContent
            ? sanitizeText(rawContent.title, (base as HeroSectionContent).title)
            : (base as HeroSectionContent).title,
        subtitle:
          rawContent && typeof rawContent === "object" && "subtitle" in rawContent
            ? sanitizeText(rawContent.subtitle, (base as HeroSectionContent).subtitle)
            : (base as HeroSectionContent).subtitle,
        background_image_url:
          rawContent &&
          typeof rawContent === "object" &&
          "background_image_url" in rawContent
            ? sanitizeText(rawContent.background_image_url)
            : (base as HeroSectionContent).background_image_url ?? "",
        action:
          rawContent && typeof rawContent === "object"
            ? sanitizeAction("action" in rawContent ? rawContent.action : null)
            : (base as HeroSectionContent).action ?? null,
      } satisfies HeroSectionContent,
    };
  }

  if (type === "about") {
    const base =
      fallback.type === "about" ? fallback.content : { title: "About", paragraph: "" };
    return {
      id,
      type,
      content: {
        title:
          rawContent && typeof rawContent === "object" && "title" in rawContent
            ? sanitizeText(rawContent.title, (base as AboutSectionContent).title)
            : (base as AboutSectionContent).title,
        paragraph:
          rawContent && typeof rawContent === "object" && "paragraph" in rawContent
            ? sanitizeText(rawContent.paragraph, (base as AboutSectionContent).paragraph)
            : (base as AboutSectionContent).paragraph,
      } satisfies AboutSectionContent,
    };
  }

  if (type === "features") {
    const base =
      fallback.type === "features"
        ? fallback.content
        : { title: "Features", cards: [] };
    return {
      id,
      type,
      content: {
        title:
          rawContent && typeof rawContent === "object" && "title" in rawContent
            ? sanitizeText(rawContent.title, (base as FeaturesSectionContent).title)
            : (base as FeaturesSectionContent).title,
        cards:
          rawContent && typeof rawContent === "object"
            ? normalizeFeatureCards("cards" in rawContent ? rawContent.cards : [])
            : (base as FeaturesSectionContent).cards,
      } satisfies FeaturesSectionContent,
    };
  }

  if (type === "events") {
    const base =
      fallback.type === "events" ? fallback.content : { title: "Events", items: [] };
    return {
      id,
      type,
      content: {
        title:
          rawContent && typeof rawContent === "object" && "title" in rawContent
            ? sanitizeText(rawContent.title, (base as EventsSectionContent).title)
            : (base as EventsSectionContent).title,
        items:
          rawContent && typeof rawContent === "object"
            ? normalizeEventItems("items" in rawContent ? rawContent.items : [])
            : (base as EventsSectionContent).items,
      } satisfies EventsSectionContent,
    };
  }

  if (type === "testimonials") {
    const base =
      fallback.type === "testimonials"
        ? fallback.content
        : { title: "Testimonials", items: [] };
    return {
      id,
      type,
      content: {
        title:
          rawContent && typeof rawContent === "object" && "title" in rawContent
            ? sanitizeText(rawContent.title, (base as TestimonialsSectionContent).title)
            : (base as TestimonialsSectionContent).title,
        items:
          rawContent && typeof rawContent === "object"
            ? normalizeTestimonials("items" in rawContent ? rawContent.items : [])
            : (base as TestimonialsSectionContent).items,
      } satisfies TestimonialsSectionContent,
    };
  }

  const base =
    fallback.type === "cta" ? fallback.content : { message: "", action: null };
  return {
    id,
    type: "cta",
    content: {
      message:
        rawContent && typeof rawContent === "object" && "message" in rawContent
          ? sanitizeText(rawContent.message, (base as CtaSectionContent).message)
          : (base as CtaSectionContent).message,
      action:
        rawContent && typeof rawContent === "object"
          ? sanitizeAction("action" in rawContent ? rawContent.action : null)
          : (base as CtaSectionContent).action ?? null,
    } satisfies CtaSectionContent,
  };
}

function sanitizePages(
  value: unknown,
  fallback: ChapterWebsitePage[],
): ChapterWebsitePage[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const usedSlugs = new Set<string>();
  const sanitized: ChapterWebsitePage[] = [];

  value.forEach((page, index) => {
    if (!page || typeof page !== "object") {
      return;
    }

    const name =
      "name" in page && typeof page.name === "string" && page.name.trim()
        ? page.name.trim()
        : index === 0
          ? "Home"
          : `Page ${index + 1}`;
    const isHome = ("is_home" in page && Boolean(page.is_home)) || index === 0;
    const rawSlug =
      "slug" in page && typeof page.slug === "string" ? page.slug.trim() : "";
    const slug = isHome
      ? ""
      : uniqueSlug(rawSlug || name, usedSlugs, `page-${index + 1}`);
    const fallbackPage = fallback[Math.min(index, fallback.length - 1)] ?? fallback[0];
    const rawSections =
      "sections" in page && Array.isArray(page.sections) ? page.sections : [];
    const sections =
      rawSections.length > 0
        ? rawSections.map((section: unknown, sectionIndex: number) =>
            normalizeSection(
              section,
              fallbackPage.sections[
                Math.min(sectionIndex, fallbackPage.sections.length - 1)
              ] ?? fallbackPage.sections[0],
            ),
          )
        : fallbackPage.sections;

    sanitized.push({
      id:
        "id" in page && typeof page.id === "string" && page.id.trim()
          ? page.id.trim()
          : createId("page"),
      name,
      slug,
      is_home: isHome,
      show_in_nav: "show_in_nav" in page ? Boolean(page.show_in_nav) : !isHome,
      nav_label:
        "nav_label" in page && typeof page.nav_label === "string"
          ? page.nav_label.trim() || name
          : name,
      sections,
    });
  });

  if (sanitized.length === 0) {
    return fallback;
  }

  const homeIndex = sanitized.findIndex((page) => page.is_home || page.slug === "");
  const normalized = sanitized.map((page, index) => ({
    ...page,
    is_home: index === (homeIndex >= 0 ? homeIndex : 0),
    slug: index === (homeIndex >= 0 ? homeIndex : 0) ? "" : page.slug,
  }));

  return normalized;
}

function deriveLegacyFieldsFromPages(content: GeneratedChapterContent) {
  const homePage = content.pages?.find((page) => page.is_home) ?? content.pages?.[0];
  if (!homePage) {
    return content;
  }

  const hero = homePage.sections.find((section) => section.type === "hero");
  const about = homePage.sections.find((section) => section.type === "about");
  const features = homePage.sections.find((section) => section.type === "features");
  const events = homePage.sections.find((section) => section.type === "events");
  const testimonials = homePage.sections.find(
    (section) => section.type === "testimonials",
  );
  const cta = homePage.sections.find((section) => section.type === "cta");

  if (hero?.type === "hero") {
    content.hero_headline = hero.content.title;
    content.hero_subheadline = hero.content.subtitle;
  }

  if (about?.type === "about") {
    content.about_section = about.content.paragraph;
  }

  if (features?.type === "features") {
    content.why_action_learning = features.content.cards
      .map((card) => card.description)
      .filter(Boolean);
  }

  if (events?.type === "events") {
    content.event_highlight =
      events.content.items[0]?.description ??
      events.content.items[0]?.title ??
      content.event_highlight;
  }

  if (testimonials?.type === "testimonials") {
    content.testimonial_formatted =
      testimonials.content.items[0]?.quote ?? content.testimonial_formatted;
  }

  if (cta?.type === "cta") {
    content.cta_text = cta.content.message;
  }

  return content;
}

function deriveLocalNavItems(content: GeneratedChapterContent): NavItem[] {
  if (!content.pages?.length) {
    return sanitizeNavItems(content.local_nav_json);
  }

  const navItems = content.pages
    .filter((page) => page.show_in_nav)
    .map((page) => ({
      href: page.is_home ? "." : `./${page.slug}`,
      label: page.nav_label?.trim() || page.name,
    }));

  return navItems.length > 0 ? navItems : sanitizeNavItems(content.local_nav_json);
}

export function getDefaultChapterContent(
  chapter: ChapterRecord,
): GeneratedChapterContent {
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
    pages: [],
  };

  defaultContent.pages = createDefaultPages(chapter, defaultContent);
  defaultContent.local_nav_json = deriveLocalNavItems(defaultContent);
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
    hero_headline: sanitizeText(raw.hero_headline, defaults.hero_headline),
    hero_subheadline: sanitizeText(
      raw.hero_subheadline,
      defaults.hero_subheadline,
    ),
    about_section: sanitizeText(raw.about_section, defaults.about_section),
    why_action_learning:
      Array.isArray(raw.why_action_learning) && raw.why_action_learning.length > 0
        ? raw.why_action_learning.filter(
            (item): item is string => typeof item === "string" && Boolean(item.trim()),
          )
        : defaults.why_action_learning,
    coaches_intro: sanitizeText(raw.coaches_intro, defaults.coaches_intro),
    event_highlight: sanitizeText(raw.event_highlight, defaults.event_highlight),
    testimonial_formatted: sanitizeText(
      raw.testimonial_formatted,
      defaults.testimonial_formatted,
    ),
    cta_text: sanitizeText(raw.cta_text, defaults.cta_text),
    meta_description: sanitizeText(
      raw.meta_description,
      defaults.meta_description,
    ),
    local_nav_json: sanitizeNavItems(raw.local_nav_json),
    sections: [],
    pages: [],
  };

  merged.pages = sanitizePages(raw.pages, createDefaultPages(chapter, merged));
  merged.local_nav_json = deriveLocalNavItems(merged);

  const homePage = merged.pages.find((page) => page.is_home) ?? merged.pages[0];
  merged.sections = homePage?.sections ?? defaults.sections ?? [];

  return deriveLegacyFieldsFromPages(merged);
}

export function getPageBySlug(
  content: GeneratedChapterContent,
  pageSlug?: string,
): ChapterWebsitePage | null {
  const pages = content.pages ?? [];

  if (pages.length === 0) {
    return null;
  }

  if (!pageSlug) {
    return pages.find((page) => page.is_home) ?? pages[0];
  }

  return pages.find((page) => page.slug === pageSlug) ?? null;
}
