"use client";

import Link from "next/link";

import type {
  ChapterContentSection,
  ChapterWebsitePage,
  NavItem,
} from "@/lib/types";

interface ChapterWebsiteRendererProps {
  chapterName: string;
  chapterSlug?: string;
  pages: ChapterWebsitePage[];
  activePage: ChapterWebsitePage;
  navItems: NavItem[];
  preview?: boolean;
}

function resolveNavHref(item: NavItem, chapterSlug?: string, preview?: boolean) {
  if (preview || !chapterSlug) {
    return "#";
  }

  if (item.href === "." || item.href === "./") {
    return `/${chapterSlug}`;
  }

  if (item.href.startsWith("./")) {
    return `/${chapterSlug}/${item.href.slice(2)}`;
  }

  return item.href;
}

function renderAction(
  text?: string,
  url?: string,
  preview?: boolean,
  className = "button-primary",
) {
  if (!text || !url) {
    return null;
  }

  if (preview) {
    return (
      <a className={className} href="#" onClick={(event) => event.preventDefault()}>
        {text}
      </a>
    );
  }

  const isExternal = /^(https?:|mailto:|tel:)/i.test(url);
  return (
    <a
      className={className}
      href={url}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {text}
    </a>
  );
}

function renderSection(section: ChapterContentSection, preview?: boolean) {
  if (section.type === "hero") {
    const content = section.content;
    return (
      <section
        className="page-header"
        key={section.id}
        style={{
          background:
            content.background_image_url
              ? `linear-gradient(rgba(20, 28, 48, 0.56), rgba(20, 28, 48, 0.56)), url(${content.background_image_url}) center / cover`
              : undefined,
          color: content.background_image_url ? "#fff" : undefined,
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h1
            className="section-title"
            style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", color: content.background_image_url ? "#fff" : undefined }}
          >
            {content.title}
          </h1>
          {content.subtitle ? (
            <p
              className="section-copy"
              style={{
                color: content.background_image_url ? "rgba(255,255,255,0.9)" : undefined,
              }}
            >
              {content.subtitle}
            </p>
          ) : null}
          {content.action?.text && content.action?.url ? (
            <div style={{ marginTop: "1rem" }}>
              {renderAction(content.action.text, content.action.url, preview)}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (section.type === "about") {
    const content = section.content;
    return (
      <section className="section" key={section.id}>
        <div className="container">
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy">{content.paragraph}</p>
        </div>
      </section>
    );
  }

  if (section.type === "features") {
    const content = section.content;
    if (content.cards.length === 0) {
      return null;
    }

    return (
      <section className="section" key={section.id}>
        <div className="container">
          <h2 className="section-title">{content.title}</h2>
          <div className="card-grid" style={{ marginTop: "1.25rem" }}>
            {content.cards.map((card) => (
              <article className="feature-card" key={card.id}>
                {card.icon ? (
                  <div
                    aria-hidden="true"
                    style={{
                      fontSize: "1.4rem",
                      lineHeight: 1,
                      marginBottom: "0.9rem",
                    }}
                  >
                    {card.icon}
                  </div>
                ) : null}
                <h3 style={{ fontSize: "1.05rem", color: "var(--foreground)" }}>
                  {card.title}
                </h3>
                <p style={{ marginTop: "0.5rem", color: "var(--muted)", lineHeight: 1.7 }}>
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "events") {
    const content = section.content;
    if (content.items.length === 0) {
      return null;
    }

    return (
      <section className="section" key={section.id}>
        <div className="container">
          <h2 className="section-title">{content.title}</h2>
          <div className="card-grid" style={{ marginTop: "1.25rem" }}>
            {content.items.map((item) => (
              <article className="feature-card" key={item.id}>
                <h3 style={{ fontSize: "1.08rem", color: "var(--foreground)" }}>
                  {item.title}
                </h3>
                {item.date ? (
                  <p style={{ marginTop: "0.35rem", color: "var(--brand)", fontWeight: 600 }}>
                    {item.date}
                  </p>
                ) : null}
                <p style={{ marginTop: "0.75rem", color: "var(--muted)", lineHeight: 1.7 }}>
                  {item.description}
                </p>
                {item.action?.text && item.action?.url ? (
                  <div style={{ marginTop: "1rem" }}>
                    {renderAction(item.action.text, item.action.url, preview, "home-link")}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "testimonials") {
    const content = section.content;
    if (content.items.length === 0) {
      return null;
    }

    return (
      <section className="section" key={section.id}>
        <div className="container">
          <h2 className="section-title">{content.title}</h2>
          <div style={{ display: "grid", gap: "1.25rem", marginTop: "1.25rem" }}>
            {content.items.map((item) => (
              <blockquote
                className="feature-card"
                key={item.id}
                style={{ borderLeft: "4px solid var(--brand)", fontStyle: "italic" }}
              >
                <p style={{ color: "var(--foreground)", lineHeight: 1.8 }}>
                  &ldquo;{item.quote}&rdquo;
                </p>
                {item.author ? (
                  <footer
                    style={{
                      marginTop: "0.75rem",
                      fontStyle: "normal",
                      color: "var(--muted)",
                      fontSize: "0.9rem",
                    }}
                  >
                    — {item.author}
                  </footer>
                ) : null}
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const content = section.content;
  return (
    <section className="cta-shell" key={section.id} style={{ textAlign: "center" }}>
      <div className="container">
        <p className="section-title" style={{ fontSize: "1.35rem" }}>
          {content.message}
        </p>
        {content.action?.text && content.action?.url ? (
          <div style={{ marginTop: "1rem" }}>
            {renderAction(content.action.text, content.action.url, preview)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ChapterWebsiteRenderer({
  chapterName,
  chapterSlug,
  pages,
  activePage,
  navItems,
  preview = false,
}: ChapterWebsiteRendererProps) {
  return (
    <div className={preview ? "feature-card" : undefined}>
      {preview ? (
        <p className="eyebrow" style={{ marginBottom: "1rem" }}>
          Preview — {chapterName} / {activePage.name}
        </p>
      ) : null}

      {navItems.length > 0 ? (
        <section className="section" style={{ paddingTop: preview ? 0 : "0.75rem", paddingBottom: "0.75rem" }}>
          <div className="container" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {navItems.map((item) =>
              preview ? (
                <span className="button-secondary" key={`${item.href}-${item.label}`} style={{ fontSize: "0.85rem" }}>
                  {item.label}
                </span>
              ) : (
                <Link
                  className="button-secondary"
                  href={resolveNavHref(item, chapterSlug, preview)}
                  key={`${item.href}-${item.label}`}
                  style={{ fontSize: "0.85rem" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </section>
      ) : null}

      {!preview ? <div className="page-divider" /> : null}

      {activePage.sections.map((section) => renderSection(section, preview))}

      {pages.length === 0 ? (
        <section className="section">
          <div className="container">
            <p className="section-copy">No page sections have been added yet.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
