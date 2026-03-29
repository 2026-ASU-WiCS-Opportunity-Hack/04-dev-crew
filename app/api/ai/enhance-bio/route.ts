import { NextResponse } from "next/server";

import { enhanceCoachBio } from "@/lib/ai/enhance-bio";
import type { BioEnhancementInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BioEnhancementInput;

    if (!body.fullName || !body.certificationLevel || !body.rawBio) {
      return NextResponse.json(
        {
          ok: false,
          error: "fullName, certificationLevel, and rawBio are required.",
        },
        { status: 400 },
      );
    }

    const enhancedBio = await enhanceCoachBio(body);
    return NextResponse.json({
      ok: true,
      data: { enhancedBio },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to enhance bio.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
