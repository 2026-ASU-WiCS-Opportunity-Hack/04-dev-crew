import { getOpenAIClient } from "@/lib/openai/client";

const EMBEDDING_MODEL = "text-embedding-3-small";

export async function createEmbedding(input: string) {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
  });

  return response.data[0]?.embedding ?? [];
}

export function buildCoachEmbeddingText(input: {
  fullName: string;
  certificationLevel: string;
  locationCity?: string | null;
  locationCountry?: string | null;
  bio?: string | null;
  specializations?: string[];
}) {
  return [
    input.fullName,
    input.certificationLevel,
    input.locationCity,
    input.locationCountry,
    input.bio,
    ...(input.specializations ?? []),
  ]
    .filter(Boolean)
    .join(" | ");
}
