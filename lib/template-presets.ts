import type { GlobalBrandingSettings, TemplateId } from "@/lib/types";

export type TemplatePreset = {
  id: TemplateId;
  name: string;
  description: string;
  thumbnailLabel: string;
  defaults: Pick<
    GlobalBrandingSettings,
    | "template_id"
    | "brand_color"
    | "brand_dark_color"
    | "accent_color"
    | "footer_background"
    | "header_cta_label"
    | "footer_summary"
  >;
};

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "minimalist",
    name: "Minimalist Landing Page",
    description: "Airy spacing, centered navigation, soft neutrals, and a calm editorial feel.",
    thumbnailLabel: "Minimalist",
    defaults: {
      template_id: "minimalist",
      brand_color: "#c6ceda",
      brand_dark_color: "#1f2937",
      accent_color: "#e5e7eb",
      footer_background: "#f8f9fb",
      header_cta_label: "Contact WIAL",
      footer_summary:
        "A quiet, focused WIAL experience built for readability and trust.",
    },
  },
  {
    id: "vibrant",
    name: "Vibrant Landing Page",
    description: "High-energy gradients, rounded cards, and a more promotional, modern rhythm.",
    thumbnailLabel: "Vibrant",
    defaults: {
      template_id: "vibrant",
      brand_color: "#ec4899",
      brand_dark_color: "#7c3aed",
      accent_color: "#facc15",
      footer_background: "#140f2a",
      header_cta_label: "Join WIAL",
      footer_summary:
        "A bright, energetic WIAL shell designed to spotlight programs and calls to action.",
    },
  },
  {
    id: "dark",
    name: "Dark Landing Page",
    description: "Premium dark surfaces, crisp grids, and higher contrast for a more polished tone.",
    thumbnailLabel: "Dark",
    defaults: {
      template_id: "dark",
      brand_color: "#e5e7eb",
      brand_dark_color: "#111827",
      accent_color: "#38bdf8",
      footer_background: "#0f172a",
      header_cta_label: "Enter WIAL",
      footer_summary:
        "A darker premium shell for chapters that want more contrast and structure.",
    },
  },
];

export function getTemplatePreset(templateId: TemplateId) {
  return (
    TEMPLATE_PRESETS.find((preset) => preset.id === templateId) ?? TEMPLATE_PRESETS[0]
  );
}
