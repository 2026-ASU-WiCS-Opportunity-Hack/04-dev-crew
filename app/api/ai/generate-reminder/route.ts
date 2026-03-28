import { NextResponse } from "next/server";

import { generateReminderEmail } from "@/lib/ai/generate-reminder";
import type { ReminderGenerationInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReminderGenerationInput;

    if (!body.coachName || !body.certificationLevel || !body.expiryDate) {
      return NextResponse.json(
        {
          ok: false,
          error: "coachName, certificationLevel, and expiryDate are required.",
        },
        { status: 400 },
      );
    }

    const reminder = await generateReminderEmail(body);
    return NextResponse.json({ ok: true, data: reminder });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to generate reminder.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
