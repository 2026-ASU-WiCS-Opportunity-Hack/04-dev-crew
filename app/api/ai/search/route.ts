import { NextResponse } from "next/server";

import { semanticCoachSearch } from "@/lib/ai/search";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string };

    if (!body.query?.trim()) {
      return NextResponse.json(
        { ok: false, error: "query is required." },
        { status: 400 },
      );
    }

    const results = await semanticCoachSearch(body.query);
    return NextResponse.json({ ok: true, data: results });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to search coaches.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
