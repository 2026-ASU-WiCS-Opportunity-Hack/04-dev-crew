import { getOpenAIClient } from "@/lib/openai/client";
import { parseModelJson } from "@/lib/ai/parse-json";
import type {
  CampaignGenerationInput,
  CampaignGenerationOutput,
} from "@/lib/types";

const CAMPAIGN_MODEL = "gpt-4o-mini";

export async function generateCampaignContent(
  input: CampaignGenerationInput,
): Promise<CampaignGenerationOutput> {
  const openai = getOpenAIClient();
  const response = await openai.responses.create({
    model: CAMPAIGN_MODEL,
    input: [
      {
        role: "system",
        content:
          "Generate a campaign draft as JSON with keys subject, bodyHtml, previewText. The HTML should be simple email-safe markup. Return only JSON.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  return parseModelJson<CampaignGenerationOutput>(response.output_text.trim());
}
