import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getCommitteeDashboardData } from "@/services/committeeDashboardService";

// Why there are 3 route files (instead of 1):
// 1) This file handles collection-level reads: GET list of ideas to evaluate.
// 2) [ideaId]/route.ts handles item-level mutation: POST submit one idea evaluation.
// 3) [ideaId]/reports/route.ts handles item sub-resource reads: GET reports for one idea.
//
// This separation matches REST resource boundaries and keeps each handler focused.
// It also improves maintainability, permissions debugging, and React Query cache mapping.
//
// Request tree for this file:
// EvaluationTab (client) -> /api/committee-dashboard/evaluations (this file)
// -> session/role check (server) -> server service -> backend API -> JSON back to client.

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = String(session.user.role || "").trim().toUpperCase();
    if (!role.includes("COMMITTEE_MEMBER")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await getCommitteeDashboardData();
    return NextResponse.json({ ideas: data.ideas }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to load evaluation ideas" },
      { status: 500 },
    );
  }
}
