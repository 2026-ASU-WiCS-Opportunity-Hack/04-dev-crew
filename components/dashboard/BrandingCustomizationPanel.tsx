"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { getTemplatePreset, TEMPLATE_PRESETS } from "@/lib/template-presets";
import type { GlobalBrandingSettings, TemplateId } from "@/lib/types";

const DEFAULT_BRANDING: GlobalBrandingSettings = {
  id: "global",
  template_id: "minimalist",
  logo_url: null,
  site_name: "WIAL Global",
  header_cta_label: "Login",
  primary_nav_json: [
    { href: "/certification", label: "Certification" },
    { href: "/coaches", label: "Find a Coach" },
    { href: "/events", label: "Programs" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  footer_summary:
    "The world's leading authority in Action Learning training and certification.",
  executive_director_email: "info@wial.org",
  brand_color: "#c6ceda",
  brand_dark_color: "#1f2937",
  accent_color: "#e5e7eb",
  footer_background: "#f8f9fb",
  template_version: 1,
  updated_at: null,
  updated_by: null,
};

const STORAGE_KEY = "wial-branding-draft";

const accordionSections = [
  { id: "identity", title: "Site Identity" },
  { id: "header", title: "Header" },
  { id: "footer", title: "Footer" },
  { id: "colors", title: "Colors" },
] as const;

type SectionId = (typeof accordionSections)[number]["id"];
type DeviceMode = "desktop" | "mobile";

function serializeSettings(settings: GlobalBrandingSettings) {
  return JSON.stringify(settings);
}

function applyTemplateDefaults(
  current: GlobalBrandingSettings,
  templateId: TemplateId,
): GlobalBrandingSettings {
  const preset = getTemplatePreset(templateId);

  return {
    ...current,
    ...preset.defaults,
    template_id: preset.id,
  };
}

function navItemsToText(
  navItems: GlobalBrandingSettings["primary_nav_json"],
) {
  return navItems.map((item) => `${item.label}|${item.href}`).join("\n");
}

function parseNavText(value: string) {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = lines
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part?.trim());
      if (!label || !href) {
        return null;
      }

      return { label, href };
    })
    .filter((item): item is { label: string; href: string } => Boolean(item));

  return parsed.length > 0 ? parsed : DEFAULT_BRANDING.primary_nav_json;
}

export function BrandingCustomizationPanel() {
  const [publishedBranding, setPublishedBranding] =
    useState<GlobalBrandingSettings>(DEFAULT_BRANDING);
  const [draftBranding, setDraftBranding] =
    useState<GlobalBrandingSettings>(DEFAULT_BRANDING);
  const [navText, setNavText] = useState(navItemsToText(DEFAULT_BRANDING.primary_nav_json));
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [notificationSummary, setNotificationSummary] = useState<{
    recipients: number;
    delivery: "sent" | "simulated" | "skipped";
  } | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [openSections, setOpenSections] = useState<SectionId[]>([
    "identity",
    "header",
  ]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  useEffect(() => {
    async function loadBranding() {
      try {
        const response = await fetch("/api/admin/branding");
        const payload = await response.json();
        const nextSettings =
          response.ok && payload.ok && payload.data
            ? (payload.data as GlobalBrandingSettings)
            : DEFAULT_BRANDING;

        setPublishedBranding(nextSettings);

        const savedDraft =
          typeof window !== "undefined"
            ? window.localStorage.getItem(STORAGE_KEY)
            : null;

        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft) as GlobalBrandingSettings;
          setDraftBranding(parsedDraft);
          setNavText(navItemsToText(parsedDraft.primary_nav_json));
          setStatus("Loaded local draft.");
        } else {
          setDraftBranding(nextSettings);
          setNavText(navItemsToText(nextSettings.primary_nav_json));
        }
      } catch {
        setDraftBranding(DEFAULT_BRANDING);
        setNavText(navItemsToText(DEFAULT_BRANDING.primary_nav_json));
      } finally {
        setLoading(false);
      }
    }

    loadBranding();
  }, []);

  const unsavedChanges = useMemo(
    () => serializeSettings(draftBranding) !== serializeSettings(publishedBranding),
    [draftBranding, publishedBranding],
  );

  const activeTemplate = getTemplatePreset(draftBranding.template_id);

  function updateDraft(
    updater: (current: GlobalBrandingSettings) => GlobalBrandingSettings,
  ) {
    setDraftBranding((current) => updater(current));
  }

  function toggleSection(sectionId: SectionId) {
    setOpenSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  }

  function selectTemplate(templateId: TemplateId) {
    const nextDraft = applyTemplateDefaults(draftBranding, templateId);
    setDraftBranding(nextDraft);
    setNavText(navItemsToText(nextDraft.primary_nav_json));
    setTemplateModalOpen(false);
    setStatus(`${getTemplatePreset(templateId).name} loaded into draft.`);
  }

  async function saveDraft() {
    setSavingDraft(true);
    setStatus(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draftBranding));
      setStatus("Draft saved locally.");
    } finally {
      setSavingDraft(false);
    }
  }

  function resetDraft() {
    setDraftBranding(publishedBranding);
    setNavText(navItemsToText(publishedBranding.primary_nav_json));
    window.localStorage.removeItem(STORAGE_KEY);
    setStatus("Draft reset to published template.");
    setNotificationSummary(null);
  }

  async function publishChanges() {
    setPublishing(true);
    setStatus(null);
    setNotificationSummary(null);

    try {
      const response = await fetch("/api/admin/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftBranding),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Failed to publish branding.");
      }

      const nextPublished = payload.data as GlobalBrandingSettings;
      setPublishedBranding(nextPublished);
      setDraftBranding(nextPublished);
      setNavText(navItemsToText(nextPublished.primary_nav_json));
      window.localStorage.removeItem(STORAGE_KEY);
      setNotificationSummary(payload.notification ?? null);
      setStatus("Branding published across all chapter sites.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to publish branding.",
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="customizer">
      <div className="customizer__bar">
        <div className="customizer__bar-left">
          <h2 className="customizer__title">Live template editor</h2>
        </div>

        <div className="customizer__bar-right">
          <div className="customizer__devices" aria-label="Preview device">
            <button
              className={deviceMode === "desktop" ? "is-active" : ""}
              type="button"
              onClick={() => setDeviceMode("desktop")}
            >
              Desktop
            </button>
            <button
              className={deviceMode === "mobile" ? "is-active" : ""}
              type="button"
              onClick={() => setDeviceMode("mobile")}
            >
              Mobile
            </button>
          </div>

          <button
            className="button-secondary"
            type="button"
            onClick={saveDraft}
            disabled={savingDraft || loading}
          >
            {savingDraft ? "Saving..." : "Save Draft"}
          </button>
          <button className="button-secondary" type="button" onClick={resetDraft}>
            Reset
          </button>
          <button
            className="site-header__cta customizer__publish"
            type="button"
            onClick={publishChanges}
            disabled={publishing || loading}
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
          <span
            className={`customizer__status-pill customizer__status-pill--inline ${
              unsavedChanges ? "customizer__status-pill--dirty" : ""
            }`}
          >
            {unsavedChanges ? "Unsaved changes" : "All changes published"}
          </span>
        </div>
      </div>

      <div className="customizer__body">
        <aside className="customizer__panel">
          {loading ? (
            <p className="admin-branding__status">Loading customization settings...</p>
          ) : (
            <div className="customizer__panel-content">
              <section className="customizer__template-toolbar">
                <div className="customizer__template-summary">
                  <span className="customizer__template-badge">{activeTemplate.name}</span>
                </div>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => setTemplateModalOpen(true)}
                >
                  Change Template
                </button>
              </section>

              <div className="customizer__accordion">
                {accordionSections.map((section) => {
                  const isOpen = openSections.includes(section.id);

                  return (
                    <section className="customizer__accordion-item" key={section.id}>
                      <button
                        className="customizer__accordion-trigger"
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleSection(section.id)}
                      >
                        <span>{section.title}</span>
                        <span className={isOpen ? "is-open" : ""}>+</span>
                      </button>

                      <div
                        className={`customizer__accordion-panel ${
                          isOpen ? "is-open" : ""
                        }`}
                      >
                        <div className="customizer__accordion-content">
                          {section.id === "identity" ? (
                            <>
                              <div className="admin-branding__field">
                                <label htmlFor="branding-logo-url">Logo image URL</label>
                                <input
                                  id="branding-logo-url"
                                  type="text"
                                  placeholder="https://example.com/logo.png"
                                  value={draftBranding.logo_url ?? ""}
                                  onChange={(event) =>
                                    updateDraft((current) => ({
                                      ...current,
                                      logo_url: event.target.value || null,
                                    }))
                                  }
                                />
                              </div>
                              <div className="admin-branding__field">
                                <label htmlFor="branding-site-name">Site name</label>
                                <input
                                  id="branding-site-name"
                                  type="text"
                                  value={draftBranding.site_name}
                                  onChange={(event) =>
                                    updateDraft((current) => ({
                                      ...current,
                                      site_name: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </>
                          ) : null}

                          {section.id === "header" ? (
                            <>
                              <div className="admin-branding__field">
                                <label htmlFor="branding-header-cta">CTA label</label>
                                <input
                                  id="branding-header-cta"
                                  type="text"
                                  value={draftBranding.header_cta_label}
                                  onChange={(event) =>
                                    updateDraft((current) => ({
                                      ...current,
                                      header_cta_label: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="admin-branding__field">
                                <label htmlFor="branding-nav">Navigation</label>
                                <textarea
                                  id="branding-nav"
                                  value={navText}
                                  onChange={(event) => {
                                    const nextText = event.target.value;
                                    setNavText(nextText);
                                    updateDraft((current) => ({
                                      ...current,
                                      primary_nav_json: parseNavText(nextText),
                                    }));
                                  }}
                                />
                              </div>
                            </>
                          ) : null}

                          {section.id === "footer" ? (
                            <>
                              <div className="admin-branding__field">
                                <label htmlFor="branding-footer-summary">Summary</label>
                                <textarea
                                  id="branding-footer-summary"
                                  value={draftBranding.footer_summary}
                                  onChange={(event) =>
                                    updateDraft((current) => ({
                                      ...current,
                                      footer_summary: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="admin-branding__field">
                                <label htmlFor="branding-email">
                                  Executive Director email
                                </label>
                                <input
                                  id="branding-email"
                                  type="email"
                                  value={draftBranding.executive_director_email}
                                  onChange={(event) =>
                                    updateDraft((current) => ({
                                      ...current,
                                      executive_director_email: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </>
                          ) : null}

                          {section.id === "colors" ? (
                            <div className="admin-branding__swatches">
                              <ColorField
                                label="Brand"
                                value={draftBranding.brand_color}
                                onChange={(value) =>
                                  updateDraft((current) => ({
                                    ...current,
                                    brand_color: value,
                                  }))
                                }
                              />
                              <ColorField
                                label="Brand dark"
                                value={draftBranding.brand_dark_color}
                                onChange={(value) =>
                                  updateDraft((current) => ({
                                    ...current,
                                    brand_dark_color: value,
                                  }))
                                }
                              />
                              <ColorField
                                label="Accent"
                                value={draftBranding.accent_color}
                                onChange={(value) =>
                                  updateDraft((current) => ({
                                    ...current,
                                    accent_color: value,
                                  }))
                                }
                              />
                              <ColorField
                                label="Footer background"
                                value={draftBranding.footer_background}
                                onChange={(value) =>
                                  updateDraft((current) => ({
                                    ...current,
                                    footer_background: value,
                                  }))
                                }
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}

          {status ? <p className="admin-branding__status">{status}</p> : null}
          {notificationSummary ? (
            <p className="admin-branding__status">
              Chapter lead notification:{" "}
              <strong>{notificationSummary.recipients}</strong> recipients,{" "}
              <strong>{notificationSummary.delivery}</strong> delivery mode.
            </p>
          ) : null}
        </aside>

        <section className="customizer__preview-shell">
          <div
            className={`customizer__preview-frame customizer__preview-frame--${deviceMode}`}
          >
            <PreviewCanvas mode={deviceMode} settings={draftBranding} />
          </div>
        </section>
      </div>

      {templateModalOpen ? (
        <div
          className="customizer-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Choose website template"
        >
          <div
            className="customizer-modal__backdrop"
            onClick={() => setTemplateModalOpen(false)}
          />
          <div className="customizer-modal__content">
            <div className="customizer-modal__header">
              <div>
                <p className="eyebrow">Change Template</p>
                <h3 className="section-title" style={{ margin: "0.35rem 0 0" }}>
                  Choose a landing page design
                </h3>
              </div>
              <button
                className="customizer-modal__close"
                type="button"
                onClick={() => setTemplateModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="customizer-modal__grid">
              {TEMPLATE_PRESETS.map((template) => (
                <article className="customizer-modal__card" key={template.id}>
                  <div
                    className={`customizer-modal__thumb customizer-modal__thumb--${template.id}`}
                  >
                    <span />
                    <span />
                    <span />
                  </div>
                  <strong>{template.name}</strong>
                  <p>{template.description}</p>
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => selectTemplate(template.id)}
                  >
                    Select
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ColorField({
  label,
  onChange,
  value,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="admin-branding__swatch">
      <input
        aria-label={label}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div>
        <strong>{label}</strong>
        <code>{value}</code>
      </div>
    </div>
  );
}

function PreviewCanvas({
  mode,
  settings,
}: {
  mode: DeviceMode;
  settings: GlobalBrandingSettings;
}) {
  return (
    <div
      className={`customizer-preview customizer-preview--${mode} customizer-preview--${settings.template_id}`}
      style={
        {
          "--preview-brand": settings.brand_color,
          "--preview-brand-dark": settings.brand_dark_color,
          "--preview-accent": settings.accent_color,
          "--preview-footer": settings.footer_background,
        } as CSSProperties
      }
    >
      {settings.template_id === "vibrant" ? (
        <VibrantPreview mode={mode} settings={settings} />
      ) : settings.template_id === "dark" ? (
        <DarkPreview mode={mode} settings={settings} />
      ) : (
        <MinimalistPreview mode={mode} settings={settings} />
      )}
    </div>
  );
}

function PreviewWordmark({ settings }: { settings: GlobalBrandingSettings }) {
  return (
    <div className="customizer-preview__wordmark">
      {settings.logo_url ? (
        <img alt="" src={settings.logo_url} />
      ) : (
        <span className="customizer-preview__logo-dot" />
      )}
      <span>{settings.site_name}</span>
    </div>
  );
}

function PreviewNav({
  mode,
  settings,
}: {
  mode: DeviceMode;
  settings: GlobalBrandingSettings;
}) {
  return (
    <nav className="customizer-preview__nav">
      {settings.primary_nav_json.slice(0, mode === "mobile" ? 3 : 6).map((item) => (
        <span key={`${item.href}-${item.label}`}>{item.label}</span>
      ))}
    </nav>
  );
}

function MinimalistPreview({
  mode,
  settings,
}: {
  mode: DeviceMode;
  settings: GlobalBrandingSettings;
}) {
  return (
    <>
      <header className="customizer-preview__header customizer-preview__header--minimalist">
        <PreviewWordmark settings={settings} />
        <PreviewNav mode={mode} settings={settings} />
        <button className="customizer-preview__cta" type="button">
          {settings.header_cta_label}
        </button>
      </header>
      <main className="customizer-preview__main">
        <section className="customizer-preview__hero customizer-preview__hero--minimalist">
          <div>
            <p className="customizer-preview__eyebrow">Minimalist</p>
            <h3>Quiet structure for thoughtful Action Learning content.</h3>
            <p>
              Wide spacing, restrained color, and a calmer editorial rhythm for
              readers first.
            </p>
          </div>
          <div className="customizer-preview__cards">
            <article>
              <strong>About</strong>
              <p>Explain the methodology with clarity and room to breathe.</p>
            </article>
            <article>
              <strong>Sections</strong>
              <p>Simple stacked blocks with generous vertical spacing.</p>
            </article>
            <article>
              <strong>Contact</strong>
              <p>{settings.executive_director_email}</p>
            </article>
          </div>
        </section>
        <section className="customizer-preview__content">
          <div className="customizer-preview__content-card">
            <strong>Centered navigation</strong>
            <p>Minimal text links and almost no visual noise.</p>
          </div>
          <div className="customizer-preview__content-card is-accent">
            <strong>Soft palette</strong>
            <p>Light gray surfaces and understated accents keep focus on content.</p>
          </div>
        </section>
      </main>
      <footer className="customizer-preview__footer customizer-preview__footer--minimalist">
        <div>
          <strong>{settings.site_name}</strong>
          <p>{settings.footer_summary}</p>
        </div>
        <a href={`mailto:${settings.executive_director_email}`}>
          {settings.executive_director_email}
        </a>
      </footer>
    </>
  );
}

function VibrantPreview({
  mode,
  settings,
}: {
  mode: DeviceMode;
  settings: GlobalBrandingSettings;
}) {
  return (
    <>
      <header className="customizer-preview__header customizer-preview__header--vibrant">
        <PreviewWordmark settings={settings} />
        <PreviewNav mode={mode} settings={settings} />
        <button className="customizer-preview__cta" type="button">
          {settings.header_cta_label}
        </button>
      </header>
      <main className="customizer-preview__main customizer-preview__main--vibrant">
        <section className="customizer-preview__hero customizer-preview__hero--vibrant">
          <div className="customizer-preview__hero-center">
            <p className="customizer-preview__eyebrow">Vibrant</p>
            <h3>Action Learning with a brighter, faster pulse.</h3>
            <p>
              Strong gradients, rounded cards, and more promotional energy
              across the landing page.
            </p>
            <button className="customizer-preview__cta" type="button">
              {settings.header_cta_label}
            </button>
          </div>
        </section>
        <section className="customizer-preview__cards customizer-preview__cards--stacked">
          <article>
            <strong>Gradient-led hero</strong>
            <p>Bold opening section with centered messaging.</p>
          </article>
          <article>
            <strong>Feature cards</strong>
            <p>Rounded cards and punchier icon-forward content blocks.</p>
          </article>
          <article>
            <strong>Detailed footer</strong>
            <p>Multi-column footer with a richer information structure.</p>
          </article>
        </section>
      </main>
      <footer className="customizer-preview__footer customizer-preview__footer--vibrant">
        <div>
          <strong>{settings.site_name}</strong>
          <p>{settings.footer_summary}</p>
        </div>
        <div className="customizer-preview__footer-links">
          <span>Programs</span>
          <span>Events</span>
          <span>Directory</span>
        </div>
      </footer>
    </>
  );
}

function DarkPreview({
  mode,
  settings,
}: {
  mode: DeviceMode;
  settings: GlobalBrandingSettings;
}) {
  return (
    <>
      <header className="customizer-preview__header customizer-preview__header--dark">
        <PreviewWordmark settings={settings} />
        <PreviewNav mode={mode} settings={settings} />
        <button className="customizer-preview__cta" type="button">
          {settings.header_cta_label}
        </button>
      </header>
      <main className="customizer-preview__main customizer-preview__main--dark">
        <section className="customizer-preview__hero customizer-preview__hero--dark">
          <div>
            <p className="customizer-preview__eyebrow">Dark</p>
            <h3>High-contrast structure for a more premium chapter presence.</h3>
            <p>Sharp alignment, darker sections, and a more architectural grid.</p>
          </div>
          <div className="customizer-preview__content-card is-accent">
            <strong>Featured insight</strong>
            <p>Global standards, local chapter credibility, premium tone.</p>
          </div>
        </section>
        <section className="customizer-preview__dark-grid">
          <div className="customizer-preview__content-card">
            <strong>Alternating sections</strong>
            <p>Dark surfaces and cleaner dividers create stronger depth.</p>
          </div>
          <div className="customizer-preview__content-card">
            <strong>Focused navigation</strong>
            <p>Light text, sharper spacing, and more controlled hierarchy.</p>
          </div>
          <div className="customizer-preview__content-card is-accent">
            <strong>Contact</strong>
            <p>{settings.executive_director_email}</p>
          </div>
        </section>
      </main>
      <footer className="customizer-preview__footer customizer-preview__footer--dark">
        <div>
          <strong>{settings.site_name}</strong>
          <p>{settings.footer_summary}</p>
        </div>
        <a href={`mailto:${settings.executive_director_email}`}>
          {settings.executive_director_email}
        </a>
      </footer>
    </>
  );
}
