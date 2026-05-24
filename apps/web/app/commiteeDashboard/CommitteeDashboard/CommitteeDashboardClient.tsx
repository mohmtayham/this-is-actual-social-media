"use client";

import { useQuery } from "@tanstack/react-query";

import DashboardHeader from "./components/DashboardHeader";
import DashboardSidebar from "./components/DashboardSidebar/DashboardSidebar";
import { DashboardTabs } from "./components/DashboardTabs";
import { CommitteeIdea } from "./types";
import { useCommitteeDashboardStore } from "./store/useCommitteeDashboardStore";

type CommitteeDashboardClientProps = {
  ideas: CommitteeIdea[];
};

export default function CommitteeDashboardClient({
  ideas,
}: CommitteeDashboardClientProps) {
  // Why Zustand selector is used here:
  // 1) The active tab must be shared with sidebar and tabs panel without prop drilling.
  // 2) Selecting only the needed fields avoids unnecessary rerenders.
  const activeTab = useCommitteeDashboardStore((state) => state.activeTab);

  // Why React Query is used here (and why this is best practice in this exact place):
  // 1) The page already gets initial ideas from a Server Component for fast first render and secure auth.
  // 2) After hydration, committee users need fresh data while staying on the page (new assignments/status updates).
  // 3) React Query gives cache + background revalidation + error/loading management without manual effect boilerplate.
  // 4) We keep `initialData: ideas` so there is no UX jump/flicker between SSR and CSR.
  // 5) We do NOT force React Query everywhere: static/one-shot server content can stay plain server fetch.

  // How to read this useQuery block:
  // - queryKey: unique cache id for this data. Same key => same shared cache entry.
  // - queryFn: actual async function that fetches data from our protected Next route.
  // - initialData: hydrate cache with server-rendered data immediately (fast first paint).
  // - staleTime: for 30s data is considered fresh, so no aggressive refetching.
  // - refetchInterval: background sync every 30s for near-real-time dashboard updates.
  const { data } = useQuery<{ ideas: CommitteeIdea[] }>({
    // queryKey is like a stable name in the cache map.
    // If another component uses the same key, it gets shared/cached data automatically.
    queryKey: ["committee-dashboard", "ideas"],

    // queryFn runs on the client and calls our Next Route Handler.
    // We call our own route (not backend directly) so session/role checks stay on server side.
    queryFn: async () => {
      const response = await fetch("/api/ideas", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch committee ideas");
      }

      return response.json();
    },

    // initialData avoids loading flicker because we already had server-fetched ideas.
    // React Query starts with this value, then can revalidate in background.
    initialData: { ideas },

    // Keep data "fresh" for 30 seconds to balance UX and network cost.
    staleTime: 30_000,

    // Background refresh every 30 seconds so committee sees updates without manual reload.
    refetchInterval: 30_000,
  });

  // Always read from query result so UI reflects latest revalidated cache data.
  const resolvedIdeas = data?.ideas || [];

  const total = resolvedIdeas.length;
  const inProgress = resolvedIdeas.filter((item) => item.status === "in_progress").length;
  const pending = resolvedIdeas.filter((item) => item.status === "pending").length;
  const avgProgress = Math.round(
    resolvedIdeas.reduce((acc, item) => acc + (item.roadmap?.progress_percentage || 0), 0) / (resolvedIdeas.length || 1),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto grid max-w-350 grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <DashboardSidebar />

        <main className="space-y-6">
          <DashboardHeader
            total={total}
            inProgress={inProgress}
            pending={pending}
            avgProgress={avgProgress}
          />
          <DashboardTabs activeTab={activeTab} ideas={resolvedIdeas} />
        </main>
      </div>
    </div>
  );
}
