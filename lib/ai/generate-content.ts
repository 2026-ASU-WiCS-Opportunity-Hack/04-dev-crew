import { getOpenAIClient } from "@/lib/openai/client";
import { parseModelJson } from "@/lib/ai/parse-json";
import type {
  ChapterGenerationInput,
  GeneratedChapterContent,
} from "@/lib/types";

const CONTENT_MODEL = "gpt-4o-mini";

export async function generateChapterContent(
  input: ChapterGenerationInput,
): Promise<GeneratedChapterContent> {
  const openai = getOpenAIClient();
  const response = await openai.responses.create({
    model: CONTENT_MODEL,
    input: [
      {
        role: "system",
        content:
          "Generate structured WIAL chapter site content as JSON with keys hero_headline, hero_subheadline, about_section, why_action_learning, coaches_intro, event_highlight, testimonial_formatted, cta_text, meta_description. why_action_learning must be an array of exactly 3 concise strings. Return only JSON.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  return parseModelJson<GeneratedChapterContent>(response.output_text.trim());
}
