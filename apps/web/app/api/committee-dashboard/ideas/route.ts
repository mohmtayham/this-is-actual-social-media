import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getCommitteeDashboardData } from "@/services/committeeDashboardService";

// Why this route handler exists (important architecture decision):
// 1) Client components (including useQuery) cannot safely access httpOnly cookie logic directly.
// 2) This route runs on the server, so it can read session cookie and enforce role-based authorization.
// 3) It creates a secure boundary: client asks this route, route checks auth, then fetches real data.
// 4) This keeps backend URL/token/session details hidden from browser code.
// 5) It also gives us one stable endpoint for React Query caching and refetch.
export async function GET() {
  try {
    // Session must exist; otherwise dashboard data is not exposed.
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only committee users should read committee dashboard data.
    const role = String(session.user.role || "").trim().toUpperCase();
    if (!role.includes("COMMITTEE")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // If auth checks pass, read data through server-only service.
    const data = await getCommitteeDashboardData();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // Keep error response generic to avoid leaking internal details.
    return NextResponse.json(
      { message: "Failed to load committee ideas" },
      { status: 500 },
    );
  }
}
