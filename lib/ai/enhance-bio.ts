import { getOpenAIClient } from "@/lib/openai/client";
import type { BioEnhancementInput } from "@/lib/types";

const BIO_MODEL = "gpt-4o-mini";

export async function enhanceCoachBio(input: BioEnhancementInput) {
  const openai = getOpenAIClient();
  const response = await openai.responses.create({
    model: BIO_MODEL,
    input: [
      {
        role: "system",
        content:
          "Rewrite the provided coach bio into a polished, professional public profile. Keep it factual, concise, and useful for clients. Return only the final bio text.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  return response.output_text.trim();
}
