import { NextResponse } from "next/server";

import { authFetch } from "@/lib/authFetch";
import { getSession } from "@/lib/session";

// Item sub-resource read route.
// Purpose: fetch reports that belong to one idea under evaluation.
//
// Why this is its own file:
// - "reports" is a child resource of a specific idea, not the idea list itself.
// - Splitting it from [ideaId]/route.ts avoids combining read-subresource and write-evaluation logic.
// - This keeps React Query keys and endpoint intent clear: one endpoint = one data shape.
//
// Request tree for this file:
// EvaluationTab "Reports" click -> /api/committee-dashboard/evaluations/{ideaId}/reports
// -> server auth check -> authFetch to backend reports endpoint -> normalized JSON to modal.

type RouteContext = {
  params: Promise<{ ideaId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
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

    const result = await authFetch(`/reports/committee/${ideaId}/initial`);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reports";
    return NextResponse.json({ message }, { status: 500 });
  }
}          
        