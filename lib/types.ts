export type AppRole =
  | "super_admin"
  | "chapter_lead"
  | "content_creator"
  | "coach";

export type TemplateId = "minimalist" | "vibrant" | "dark";

export type CertificationLevel = "CALC" | "PALC" | "SALC" | "MALC";
export type PaymentType = "enrollment" | "certification";
export type PaymentStatus = "pending" | "paid" | "overdue" | "failed";
export type PaymentMethod = "stripe" | "paypal";

export interface ChapterRecord {
  id: string;
  name: string;
  slug: string;
  country: string;
  language: string;
  contact_name: string | null;
  contact_email: string | null;
  external_website: string | null;
  content_json: GeneratedChapterContent | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GlobalBrandingSettings {
  id: string;
  template_id: TemplateId;
  logo_url: string | null;
  site_name: string;
  header_cta_label: string;
  primary_nav_json: Array<{
    href: string;
    label: string;
  }>;
  footer_summary: string;
  executive_director_email: string;
  brand_color: string;
  brand_dark_color: string;
  accent_color: string;
  footer_background: string;
  template_version: number;
  updated_at: string | null;
  updated_by: string | null;
}

export interface ProfileRecord {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  chapter_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface CoachRecord {
  id: string;
  profile_id: string | null;
  chapter_id: string | null;
  full_name: string;
  photo_url: string | null;
  certification_level: CertificationLevel;
  certification_date: string | null;
  certification_expiry: string | null;
  bio_raw: string | null;
  bio_enhanced: string | null;
  location_city: string | null;
  location_country: string | null;
  specializations: string[];
  contact_email: string | null;
  contact_phone: string | null;
  is_approved: boolean;
  embedding: number[] | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  highlight?: string | null;
  total_session_hours?: number;
  total_ce_credits?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventRecord {
  id: string;
  chapter_id: string | null;
  title: string;
  description: string | null;
  event_date: string | null;
  end_date: string | null;
  location: string | null;
  registration_link: string | null;
  capacity: number | null;
  is_global: boolean;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  chapter_id: string;
  payer_name: string;
  payer_email: string;
  payment_type: PaymentType;
  student_count: number;
  amount_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paypal_order_id: string | null;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  due_date: string | null;
  paid_at: string | null;
  reminder_count: number;
  created_at: string;
}

export interface CampaignRecord {
  id: string;
  chapter_id: string | null;
  subject: string;
  body_html: string;
  template_type: string;
  segment_filter: Record<string, unknown> | null;
  recipient_count: number;
  sent_at: string | null;
  status: "draft" | "sent" | "failed";
  created_by: string | null;
  created_at: string;
}

export interface ChapterGenerationInput {
  chapterName: string;
  country: string;
  language: string;
  contactName?: string;
  coachNames?: string[];
  eventTitle?: string;
  eventDate?: string;
  testimonial?: string;
}

export interface GeneratedChapterContent {
  hero_headline: string;
  hero_subheadline: string;
  about_section: string;
  why_action_learning: string[];
  coaches_intro: string;
  event_highlight: string;
  testimonial_formatted: string;
  cta_text: string;
  meta_description: string;
}

export interface SearchFilters {
  location?: string | null;
  certification_level?: CertificationLevel | null;
  semantic_query: string;
  original_language?: string | null;
}

export interface SemanticSearchResponse {
  results: Array<CoachRecord & { similarity?: number }>;
  parsed: SearchFilters;
}

export interface ReminderGenerationInput {
  coachName: string;
  certificationLevel: CertificationLevel;
  expiryDate: string;
  chapterName?: string;
  recipientEmail?: string;
}

export interface ReminderGenerationOutput {
  subject: string;
  bodyHtml: string;
  previewText: string;
}

export interface CampaignGenerationInput {
  subject: string;
  intent: string;
  templateType: string;
  chapterName?: string;
  audienceDescription?: string;
}

export interface CampaignGenerationOutput {
  subject: string;
  bodyHtml: string;
  previewText: string;
}

export interface BioEnhancementInput {
  fullName: string;
  certificationLevel: CertificationLevel;
  location?: string;
  specializations?: string[];
  rawBio: string;
}

export interface CheckoutRequestBody {
  chapterId: string;
  payerName: string;
  payerEmail: string;
  paymentType: PaymentType;
  studentCount: number;
  dueDate?: string;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
