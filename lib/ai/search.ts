import { createEmbedding } from "@/lib/ai/embeddings";
import { getOpenAIClient } from "@/lib/openai/client";
import { parseModelJson } from "@/lib/ai/parse-json";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  CertificationLevel,
  SearchFilters,
  SemanticSearchResponse,
} from "@/lib/types";

const SEARCH_MODEL = "gpt-4o-mini";

function coerceCertificationLevel(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.toUpperCase();
  const allowed = ["CALC", "PALC", "SALC", "MALC"];

  if (allowed.includes(normalized)) {
    return normalized as CertificationLevel;
  }

  return null;
}

export async function parseSearchQuery(query: string): Promise<SearchFilters> {
  const openai = getOpenAIClient();
  const response = await openai.responses.create({
    model: SEARCH_MODEL,
    input: [
      {
        role: "system",
        content:
          "You parse a multilingual coach directory query into JSON with keys: location, certification_level, semantic_query, original_language. semantic_query must preserve the user's actual need. Return only JSON.",
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  const content = response.output_text.trim();
  const parsed = parseModelJson<SearchFilters>(content);

  return {
    location: parsed.location ?? null,
    certification_level: coerceCertificationLevel(
      parsed.certification_level ?? null,
    ),
    semantic_query: parsed.semantic_query || query,
    original_language: parsed.original_language ?? null,
  };
}

export async function semanticCoachSearch(
  query: string,
): Promise<SemanticSearchResponse> {
  const parsed = await parseSearchQuery(query);
  const queryEmbedding = await createEmbedding(parsed.semantic_query);
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.rpc("match_coaches", {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: 10,
  });

  if (error) {
    throw error;
  }

  const filtered = (data ?? []).filter((coach: Record<string, unknown>) => {
    const matchesLevel =
      !parsed.certification_level ||
      coach.certification_level === parsed.certification_level;
    const matchesLocation =
      !parsed.location ||
      `${coach.location_city ?? ""} ${coach.location_country ?? ""}`
        .toLowerCase()
        .includes(parsed.location.toLowerCase());

    return matchesLevel && matchesLocation;
  });

  return {
    results: filtered,
    parsed,
  };
}
