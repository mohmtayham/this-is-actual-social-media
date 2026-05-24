import { redirect } from "next/navigation";

import CommitteeDashboardClient from "./CommitteeDashboard/CommitteeDashboardClient";
import { getCommitteeDashboardData } from "@/services/committeeDashboardService";
import { getSession } from "@/lib/session";

export default async function CommitteeDashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const role = String(session.user.role || "").trim().toUpperCase();
  if (!role.includes("COMMITTEE_MEMBER")) {
    redirect("/profile");
  }

  const { ideas } = await getCommitteeDashboardData();

  return <CommitteeDashboardClient ideas={ideas} />;
}
