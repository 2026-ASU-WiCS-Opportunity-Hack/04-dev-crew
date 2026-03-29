import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { GlobalBrandingSettings } from "@/lib/types";
import type { TemplateId } from "@/lib/types";

export const DEFAULT_GLOBAL_BRANDING: GlobalBrandingSettings = {
  id: "global",
  template_id: "minimalist",
  logo_url: null,
  site_name: "WIAL Global",
  header_cta_label: "Contact WIAL",
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

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export function normalizeBrandingSettings(
  row: Partial<GlobalBrandingSettings> | null | undefined,
): GlobalBrandingSettings {
  return {
    ...DEFAULT_GLOBAL_BRANDING,
    ...row,
    template_id: sanitizeTemplateId(row?.template_id),
    logo_url: row?.logo_url ?? DEFAULT_GLOBAL_BRANDING.logo_url,
    primary_nav_json: sanitizeNavItems(row?.primary_nav_json),
    brand_color: sanitizeHexColor(row?.brand_color, DEFAULT_GLOBAL_BRANDING.brand_color),
    brand_dark_color: sanitizeHexColor(
      row?.brand_dark_color,
      DEFAULT_GLOBAL_BRANDING.brand_dark_color,
    ),
    accent_color: sanitizeHexColor(
      row?.accent_color,
      DEFAULT_GLOBAL_BRANDING.accent_color,
    ),
    footer_background: sanitizeHexColor(
      row?.footer_background,
      DEFAULT_GLOBAL_BRANDING.footer_background,
    ),
  };
}

function sanitizeTemplateId(value: string | null | undefined): TemplateId {
  if (value === "templateA" || value === "corporate" || value === "minimalist") {
    return "minimalist";
  }

  if (value === "templateB" || value === "startup" || value === "vibrant") {
    return "vibrant";
  }

  if (
    value === "templateC" ||
    value === "community" ||
    value === "creative" ||
    value === "dark"
  ) {
    return "dark";
  }

  if (value === "vibrant" || value === "dark") {
    return value;
  }

  return "minimalist";
}

function sanitizeHexColor(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  return HEX_COLOR.test(value) ? value : fallback;
}

function sanitizeNavItems(
  value:
    | Array<{ href?: string | null; label?: string | null }>
    | null
    | undefined,
) {
  if (!Array.isArray(value)) {
    return DEFAULT_GLOBAL_BRANDING.primary_nav_json;
  }

  const cleaned = value
    .map((item) => ({
      href: item?.href?.trim() || "",
      label: item?.label?.trim() || "",
    }))
    .filter((item) => item.href && item.label);

  return cleaned.length > 0 ? cleaned : DEFAULT_GLOBAL_BRANDING.primary_nav_json;
}

export async function getGlobalBrandingSettings() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("global_branding_settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();

    if (error) {
      return DEFAULT_GLOBAL_BRANDING;
    }

    return normalizeBrandingSettings(data as Partial<GlobalBrandingSettings> | null);
  } catch {
    return DEFAULT_GLOBAL_BRANDING;
  }
}
