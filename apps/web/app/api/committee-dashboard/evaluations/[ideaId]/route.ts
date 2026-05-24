import { NextRequest, NextResponse } from "next/server";

import { authFetch } from "@/lib/authFetch";
import { getSession } from "@/lib/session";

// Item mutation route.
// Purpose: submit committee evaluation for one specific idea.
//
// Why this is NOT merged with other routes:
// - The path includes an item identity ([ideaId]) and performs a write action (POST).
// - Keeping write logic separate from list/report reads avoids mixed responsibilities.
// - Different validation/error behavior lives here (payload + ideaId checks).
//
// Request tree for this file:
// EvaluationTab submit -> /api/committee-dashboard/evaluations/{ideaId}
// -> server auth check -> payload mapping (snake_case -> backend camelCase)
// -> authFetch to Nest endpoint -> response back to client.

type RouteContext = {
  params: Promise<{ ideaId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = String(session.user.role || "").trim().toUpperCase();
    if (!role.includes("COMMITTEE")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { ideaId: ideaIdParam } = await context.params;
    const ideaId = Number(ideaIdParam);

    if (!Number.isFinite(ideaId)) {
      return NextResponse.json({ message: "Invalid idea id" }, { status: 400 });
    }

    const payload = (await request.json()) as {
      evaluation_score?: number;
      description?: string;
      strengths?: string;
      weaknesses?: string;
      recommendations?: string;
    };

    const result = await authFetch(`/reports/committee/${ideaId}/initial-evaluation`, {
      method: "POST",
      body: JSON.stringify({
        evaluationScore: payload.evaluation_score,
        description: payload.description,
        strengths: payload.strengths,
        weaknesses: payload.weaknesses,
        recommendations: payload.recommendations,
      }),
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit evaluation";
    return NextResponse.json({ message }, { status: 500 });
  }
}
