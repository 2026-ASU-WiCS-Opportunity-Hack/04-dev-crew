import { getOpenAIClient } from "@/lib/openai/client";
import { parseModelJson } from "@/lib/ai/parse-json";
import type {
  ReminderGenerationInput,
  ReminderGenerationOutput,
} from "@/lib/types";

const REMINDER_MODEL = "gpt-4o-mini";

export async function generateReminderEmail(
  input: ReminderGenerationInput,
): Promise<ReminderGenerationOutput> {
  const openai = getOpenAIClient();
  const response = await openai.responses.create({
    model: REMINDER_MODEL,
    input: [
      {
        role: "system",
        content:
          "Generate a certification reminder email as JSON with keys subject, bodyHtml, previewText. Keep the tone professional and supportive. Return only JSON.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  return parseModelJson<ReminderGenerationOutput>(response.output_text.trim());
}
