import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildCoachEmbeddingText, createEmbedding } from "@/lib/ai/embeddings";
import { generateChapterContent } from "@/lib/ai/generate-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function loadLocalEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const contents = readFileSync(envPath, "utf8");

  for (const rawLine of contents.split("\n")) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnvFile();

type SeedChapter = {
  name: string;
  slug: string;
  country: string;
  language: string;
  contact_name: string;
  contact_email: string;
};

type SeedCoach = {
  chapterSlug: string | null;
  full_name: string;
  certification_level: "CALC" | "PALC" | "SALC" | "MALC";
  location_city: string;
  location_country: string;
  contact_email: string;
  specializations: string[];
  bio_raw: string;
};

type SeedEvent = {
  chapterSlug: string | null;
  title: string;
  description: string;
  event_date: string;
  end_date?: string | null;
  location: string;
  registration_link?: string | null;
  is_global: boolean;
};

type SeedPayment = {
  chapterSlug: string;
  payer_name: string;
  payer_email: string;
  payment_type: "enrollment" | "certification";
  student_count: number;
  amount_cents: number;
  status: "pending" | "paid" | "overdue" | "failed";
  due_date?: string | null;
  paid_at?: string | null;
  reminder_count?: number;
};

type SeedTestimonial = {
  chapterSlug: string | null;
  quote_text: string;
  author_name: string;
  author_title?: string | null;
  organization?: string | null;
};

type SeedClient = {
  chapterSlug: string | null;
  name: string;
  website_url: string;
  description: string;
};

const chapters: SeedChapter[] = [
  {
    name: "WIAL USA",
    slug: "usa",
    country: "United States",
    language: "en",
    contact_name: "Craig Senecal",
    contact_email: "craig@wial-usa.org",
  },
  {
    name: "WIAL Nigeria",
    slug: "nigeria",
    country: "Nigeria",
    language: "en",
    contact_name: "Chika Okonkwo",
    contact_email: "chika@wialnigeria.org",
  },
  {
    name: "WIAL Brazil",
    slug: "brazil",
    country: "Brazil",
    language: "pt",
    contact_name: "Ana Silva",
    contact_email: "ana@wialbrasil.org",
  },
  {
    name: "WIAL Netherlands",
    slug: "netherlands",
    country: "Netherlands",
    language: "en",
    contact_name: "Twan Paes",
    contact_email: "twan@wial.nl",
  },
];

const coachSeeds: SeedCoach[] = [
  {
    chapterSlug: "usa",
    full_name: "Craig Senecal",
    certification_level: "SALC",
    location_city: "Washington DC",
    location_country: "United States",
    contact_email: "craig@wial-usa.org",
    specializations: [
      "corporate leadership development",
      "executive coaching",
      "organizational change",
    ],
    bio_raw:
      "Corporate leadership development specialist with 15+ years of Fortune 500 executive coaching and organizational change management experience.",
  },
  {
    chapterSlug: "usa",
    full_name: "Bea Carson",
    certification_level: "SALC",
    location_city: "New York",
    location_country: "United States",
    contact_email: "bea@example.com",
    specializations: [
      "healthcare leadership",
      "hospital administration",
      "patient care teams",
    ],
    bio_raw:
      "Focuses on healthcare leadership, hospital administration coaching, nurse leadership programs, and patient care team dynamics.",
  },
  {
    chapterSlug: "usa",
    full_name: "James Mitchell",
    certification_level: "CALC",
    location_city: "Chicago",
    location_country: "United States",
    contact_email: "james@example.com",
    specializations: [
      "education sector",
      "academic leadership",
      "faculty teams",
    ],
    bio_raw:
      "Works in the education sector on university leadership, academic program development, and faculty team coaching.",
  },
  {
    chapterSlug: "usa",
    full_name: "Priya Sharma",
    certification_level: "PALC",
    location_city: "San Francisco",
    location_country: "United States",
    contact_email: "priya@example.com",
    specializations: [
      "technology industry",
      "startup leadership",
      "innovation teams",
    ],
    bio_raw:
      "Supports technology leaders with startup coaching, innovation team dynamics, and Silicon Valley leadership development.",
  },
  {
    chapterSlug: "nigeria",
    full_name: "Amara Okafor",
    certification_level: "CALC",
    location_city: "Lagos",
    location_country: "Nigeria",
    contact_email: "amara@example.com",
    specializations: [
      "banking",
      "government",
      "leadership development",
      "public sector transformation",
    ],
    bio_raw:
      "Supports banking and financial services organizations, government agency consulting, leadership development for Nigerian institutions, and public sector transformation.",
  },
  {
    chapterSlug: "nigeria",
    full_name: "Emeka Nwosu",
    certification_level: "PALC",
    location_city: "Abuja",
    location_country: "Nigeria",
    contact_email: "emeka@example.com",
    specializations: [
      "manufacturing",
      "supply chain leadership",
      "operational excellence",
    ],
    bio_raw:
      "Works with manufacturing sector leaders on supply chain leadership, operational excellence coaching, and industrial team performance.",
  },
  {
    chapterSlug: "nigeria",
    full_name: "Funke Adeyemi",
    certification_level: "CALC",
    location_city: "Lagos",
    location_country: "Nigeria",
    contact_email: "funke@example.com",
    specializations: [
      "ngo sector",
      "social enterprise",
      "women's empowerment",
    ],
    bio_raw:
      "Partners with NGOs and community development organizations on social enterprise leadership and women's empowerment programs.",
  },
  {
    chapterSlug: "brazil",
    full_name: "Ana Costa",
    certification_level: "SALC",
    location_city: "Sao Paulo",
    location_country: "Brazil",
    contact_email: "ana.costa@example.com",
    specializations: [
      "coaching corporativo",
      "lideranca de equipes",
      "desenvolvimento organizacional",
    ],
    bio_raw:
      "Coach corporativa focada em lideranca de equipes, desenvolvimento organizacional e empresas multinacionais no Brasil.",
  },
  {
    chapterSlug: "brazil",
    full_name: "Ricardo Santos",
    certification_level: "CALC",
    location_city: "Rio de Janeiro",
    location_country: "Brazil",
    contact_email: "ricardo@example.com",
    specializations: [
      "setor publico",
      "administracao publica",
      "lideranca governamental",
    ],
    bio_raw:
      "Atua com administracao publica, desenvolvimento de lideranca para agencias governamentais e equipes de implementacao de politicas.",
  },
  {
    chapterSlug: "brazil",
    full_name: "Mariana Oliveira",
    certification_level: "PALC",
    location_city: "Brasilia",
    location_country: "Brazil",
    contact_email: "mariana@example.com",
    specializations: [
      "gestao de saude",
      "lideranca hospitalar",
      "saude publica",
    ],
    bio_raw:
      "Especialista em gestao de saude, equipes de lideranca hospitalar e coaching para o sistema publico de saude.",
  },
  {
    chapterSlug: "netherlands",
    full_name: "Twan Paes",
    certification_level: "MALC",
    location_city: "Amsterdam",
    location_country: "Netherlands",
    contact_email: "twan@wial.nl",
    specializations: [
      "executive coaching",
      "multinational leadership",
      "digital transformation",
    ],
    bio_raw:
      "Executive coach with 20+ years of international experience in multinational leadership, innovation, and digital transformation.",
  },
  {
    chapterSlug: "netherlands",
    full_name: "Sophie de Vries",
    certification_level: "SALC",
    location_city: "Rotterdam",
    location_country: "Netherlands",
    contact_email: "sophie@example.com",
    specializations: [
      "public sector consulting",
      "government policy teams",
      "cross-cultural leadership",
    ],
    bio_raw:
      "Supports public sector consulting engagements, government policy teams, and European institutional coaching with a cross-cultural lens.",
  },
  {
    chapterSlug: "netherlands",
    full_name: "Lars Bakker",
    certification_level: "CALC",
    location_city: "The Hague",
    location_country: "Netherlands",
    contact_email: "lars@example.com",
    specializations: [
      "education sector",
      "research teams",
      "academic leadership",
    ],
    bio_raw:
      "Works with universities and research teams on academic leadership development and team dynamics.",
  },
  {
    chapterSlug: null,
    full_name: "Grace Muthoni",
    certification_level: "CALC",
    location_city: "Nairobi",
    location_country: "Kenya",
    contact_email: "grace@example.com",
    specializations: [
      "social enterprise",
      "women's empowerment",
      "community organizations",
    ],
    bio_raw:
      "Supports social enterprise coaching, women's empowerment programs, and community-based organizations across East Africa.",
  },
  {
    chapterSlug: null,
    full_name: "David Ochieng",
    certification_level: "CALC",
    location_city: "Mombasa",
    location_country: "Kenya",
    contact_email: "david@example.com",
    specializations: [
      "tourism",
      "hospitality",
      "service excellence",
    ],
    bio_raw:
      "Focuses on tourism and hospitality industry team building, service excellence coaching, and coastal Kenya business development.",
  },
];

const eventSeeds: SeedEvent[] = [
  {
    chapterSlug: null,
    title: "2026 WIAL Global Conference",
    description: "Global Action Learning conference for WIAL chapters and coaches.",
    event_date: "2026-06-15T09:00:00.000Z",
    end_date: "2026-06-17T17:00:00.000Z",
    location: "Sao Paulo, Brazil",
    registration_link: "https://wial.org/events/global-conference-2026",
    is_global: true,
  },
  {
    chapterSlug: null,
    title: "Introduction to Action Learning Webinar",
    description: "Virtual global webinar introducing Action Learning fundamentals.",
    event_date: "2026-04-10T16:00:00.000Z",
    location: "Virtual",
    registration_link: "https://wial.org/events/intro-webinar",
    is_global: true,
  },
  {
    chapterSlug: "usa",
    title: "CALC Certification Course — Virtual",
    description: "USA chapter virtual CALC certification program.",
    event_date: "2026-05-05T16:00:00.000Z",
    end_date: "2026-05-08T23:00:00.000Z",
    location: "Virtual",
    registration_link: "https://wial.org/usa/events",
    is_global: false,
  },
  {
    chapterSlug: "nigeria",
    title: "CALC Certification Lagos",
    description: "WIAL Nigeria certification event in Lagos.",
    event_date: "2026-04-15T09:00:00.000Z",
    location: "Lagos, Nigeria",
    registration_link: "https://wial.org/nigeria/events",
    is_global: false,
  },
  {
    chapterSlug: "brazil",
    title: "Curso de Certificação CALC — São Paulo",
    description: "Programa de certificação CALC em São Paulo.",
    event_date: "2026-04-20T12:00:00.000Z",
    location: "Sao Paulo, Brazil",
    registration_link: "https://wial.org/brazil/events",
    is_global: false,
  },
  {
    chapterSlug: "netherlands",
    title: "European Action Learning Summit",
    description: "European summit for Action Learning leaders and coaches.",
    event_date: "2026-05-22T09:00:00.000Z",
    location: "Amsterdam, Netherlands",
    registration_link: "https://wial.org/netherlands/events",
    is_global: false,
  },
];

const paymentSeeds: SeedPayment[] = [
  {
    chapterSlug: "usa",
    payer_name: "Craig Senecal",
    payer_email: "craig@wial-usa.org",
    payment_type: "enrollment",
    student_count: 8,
    amount_cents: 40000,
    status: "paid",
    paid_at: "2026-02-15T12:00:00.000Z",
  },
  {
    chapterSlug: "nigeria",
    payer_name: "Emeka Nwosu",
    payer_email: "emeka@example.com",
    payment_type: "enrollment",
    student_count: 5,
    amount_cents: 25000,
    status: "overdue",
    due_date: "2026-03-01",
    reminder_count: 2,
  },
  {
    chapterSlug: "nigeria",
    payer_name: "Funke Adeyemi",
    payer_email: "funke@example.com",
    payment_type: "certification",
    student_count: 3,
    amount_cents: 9000,
    status: "paid",
    paid_at: "2026-03-10T12:00:00.000Z",
  },
  {
    chapterSlug: "brazil",
    payer_name: "Ana Costa",
    payer_email: "ana.costa@example.com",
    payment_type: "enrollment",
    student_count: 10,
    amount_cents: 50000,
    status: "pending",
    due_date: "2026-04-01",
  },
  {
    chapterSlug: "netherlands",
    payer_name: "Twan Paes",
    payer_email: "twan@wial.nl",
    payment_type: "certification",
    student_count: 6,
    amount_cents: 18000,
    status: "paid",
    paid_at: "2026-03-20T12:00:00.000Z",
  },
];

const testimonialSeeds: SeedTestimonial[] = [
  {
    chapterSlug: null,
    quote_text:
      "Action Learning transformed how our leadership team approaches complex problems.",
    author_name: "Sarah Kim",
    author_title: "VP of HR",
    organization: "Samsung Electronics",
  },
  {
    chapterSlug: "usa",
    quote_text:
      "The WIAL certification program gave me tools I use every single day with my teams.",
    author_name: "Michael Torres",
    author_title: "Director of Learning",
    organization: "Deloitte",
  },
  {
    chapterSlug: "nigeria",
    quote_text:
      "Working with WIAL Nigeria coaches helped our bank develop a culture of collaborative leadership.",
    author_name: "Adesanya Ogun",
    author_title: "Managing Director",
    organization: "First Bank Nigeria",
  },
  {
    chapterSlug: "brazil",
    quote_text:
      "O Action Learning revolucionou nossa abordagem de desenvolvimento de liderança.",
    author_name: "Paulo Mendes",
    author_title: "Diretor de RH",
    organization: "Petrobras",
  },
];

const clientSeeds: SeedClient[] = [
  {
    chapterSlug: null,
    name: "Samsung Electronics",
    website_url: "https://www.samsung.com",
    description: "Global client seeded for WIAL demo data.",
  },
  {
    chapterSlug: "usa",
    name: "Deloitte",
    website_url: "https://www.deloitte.com",
    description: "USA chapter client seeded for WIAL demo data.",
  },
  {
    chapterSlug: "nigeria",
    name: "First Bank Nigeria",
    website_url: "https://www.firstbanknigeria.com",
    description: "Nigeria chapter client seeded for WIAL demo data.",
  },
  {
    chapterSlug: "brazil",
    name: "Petrobras",
    website_url: "https://petrobras.com.br",
    description: "Brazil chapter client seeded for WIAL demo data.",
  },
];

async function seedChapters() {
  const supabase = createSupabaseAdminClient();
  const createdChapters: Record<string, string> = {};

  for (const chapter of chapters) {
    const content = await generateChapterContent({
      chapterName: chapter.name,
      country: chapter.country,
      language: chapter.language,
      contactName: chapter.contact_name,
      coachNames: coachSeeds
        .filter((coach) => coach.chapterSlug === chapter.slug)
        .map((coach) => coach.full_name),
      eventTitle: `Intro to Action Learning - ${chapter.name}`,
      eventDate: new Date().toISOString(),
      testimonial: `${chapter.name} helps organizations build stronger leaders.`,
    }).catch(() => ({
      hero_headline: `${chapter.name} builds Action Learning leaders`,
      hero_subheadline:
        "Professional certification, coach discovery, and chapter growth in one platform.",
      about_section:
        `${chapter.name} is part of the global WIAL network, supporting leaders and organizations through Action Learning.`,
      why_action_learning: [
        "Develop leaders while solving real business challenges.",
        "Create stronger teams through structured reflection and action.",
        "Connect local chapter expertise with global WIAL standards.",
      ],
      coaches_intro:
        "Meet certified coaches in this chapter and discover their expertise.",
      event_highlight: `Join the upcoming ${chapter.name} certification event.`,
      testimonial_formatted:
        "\"WIAL helped our team learn faster and lead with greater confidence.\"",
      cta_text: "Connect with this chapter",
      meta_description: `Explore ${chapter.name} chapter programs, coaches, and events.`,
    }));

    const { data, error } = await supabase
      .from("chapters")
      .upsert({
        ...chapter,
        content_json: content,
        is_active: true,
      }, { onConflict: "slug" })
      .select("id, slug")
      .single();

    if (error) {
      throw error;
    }

    createdChapters[data.slug] = data.id;
  }

  return createdChapters;
}

async function seedCoaches(chapterIds: Record<string, string>) {
  const supabase = createSupabaseAdminClient();

  for (const coach of coachSeeds) {
    const embeddingText = buildCoachEmbeddingText({
      fullName: coach.full_name,
      certificationLevel: coach.certification_level,
      locationCity: coach.location_city,
      locationCountry: coach.location_country,
      bio: coach.bio_raw,
      specializations: coach.specializations,
    });

    const embedding = await createEmbedding(embeddingText).catch(() => null);

    const payload = {
      chapter_id: coach.chapterSlug ? chapterIds[coach.chapterSlug] ?? null : null,
      full_name: coach.full_name,
      certification_level: coach.certification_level,
      location_city: coach.location_city,
      location_country: coach.location_country,
      contact_email: coach.contact_email,
      specializations: coach.specializations,
      bio_raw: coach.bio_raw,
      bio_enhanced: coach.bio_raw,
      is_approved: true,
      embedding,
    };

    const { data: existing } = await supabase
      .from("coaches")
      .select("id")
      .eq("full_name", coach.full_name)
      .maybeSingle();

    const query = existing
      ? supabase.from("coaches").update(payload).eq("id", existing.id)
      : supabase.from("coaches").insert(payload);

    const { error } = await query;

    if (error) {
      throw error;
    }
  }
}

async function seedEventsAndPayments(chapterIds: Record<string, string>) {
  const supabase = createSupabaseAdminClient();

  for (const event of eventSeeds) {
    await supabase.from("events").insert({
      chapter_id: event.chapterSlug ? chapterIds[event.chapterSlug] ?? null : null,
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      end_date: event.end_date ?? null,
      location: event.location,
      registration_link: event.registration_link ?? null,
      is_global: event.is_global,
    });
  }

  for (const payment of paymentSeeds) {
    await supabase.from("payments").insert({
      chapter_id: chapterIds[payment.chapterSlug],
      payer_name: payment.payer_name,
      payer_email: payment.payer_email,
      payment_type: payment.payment_type,
      student_count: payment.student_count,
      amount_cents: payment.amount_cents,
      currency: "usd",
      payment_method: "stripe",
      status: payment.status,
      due_date: payment.due_date ?? null,
      paid_at: payment.paid_at ?? null,
      reminder_count: payment.reminder_count ?? 0,
    });
  }

  for (const testimonial of testimonialSeeds) {
    await supabase.from("testimonials").insert({
      chapter_id: testimonial.chapterSlug
        ? chapterIds[testimonial.chapterSlug] ?? null
        : null,
      quote_text: testimonial.quote_text,
      author_name: testimonial.author_name,
      author_title: testimonial.author_title ?? null,
      organization: testimonial.organization ?? null,
    });
  }

  for (const client of clientSeeds) {
    await supabase.from("clients").insert({
      chapter_id: client.chapterSlug ? chapterIds[client.chapterSlug] ?? null : null,
      name: client.name,
      website_url: client.website_url,
      description: client.description,
    });
  }

  // Seed enrollments for /enroll page testing
  const enrollmentSeeds = [
    { chapterSlug: "usa", company_name: "Acme Corp", company_code: "ACME2025", total_licenses: 20, used_licenses: 5, contact_email: "hr@acme.com", contact_name: "Jane Smith" },
    { chapterSlug: "nigeria", company_name: "Lagos Solutions Ltd", company_code: "LAGOS2025", total_licenses: 10, used_licenses: 2, contact_email: "admin@lagossolutions.ng", contact_name: "Tolu Balogun" },
    { chapterSlug: "brazil", company_name: "TechBrasil SA", company_code: "TECHBR2025", total_licenses: 15, used_licenses: 0, contact_email: "rh@techbrasil.com.br", contact_name: "Carlos Lima" },
  ];

  for (const enrollment of enrollmentSeeds) {
    const { chapterSlug, ...rest } = enrollment;
    await supabase.from("enrollments").insert({
      chapter_id: chapterIds[chapterSlug],
      ...rest,
    });
  }
}

async function main() {
  console.log("Seeding WIAL backend data...");
  const chapterIds = await seedChapters();
  await seedCoaches(chapterIds);
  await seedEventsAndPayments(chapterIds);
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
