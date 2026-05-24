"use client";

import { useMemo } from "react";
import { CommitteeIdea, ProfitSummary } from "../types";
import { useCommitteeDashboardStore } from "../store/useCommitteeDashboardStore";

const buildProfitSummary = (idea: CommitteeIdea): ProfitSummary => {
  const distributions = idea.profitDistributions || [];
  return {
    idea_id: idea.id,
    idea_title: idea.title,
    profit_distributed: distributions.length > 0,
    distributions,
  };
};

export const useCommitteeIdeas = (initialIdeas: CommitteeIdea[]) => {
  // Why data is not duplicated in local state:
  // 1) Ideas come from React Query and can refresh in background.
  // 2) Keeping a second local copy risks stale UI and sync bugs.
  const ideas = initialIdeas;

  // Why Zustand is used in this hook:
  // 1) Details/profit modals and expanded rows are interactive UI state shared across nested components.
  // 2) A central store keeps behavior consistent when components rerender from query updates.
  const selectedIdeaId = useCommitteeDashboardStore((state) => state.selectedIdeaId);
  const showDetails = useCommitteeDashboardStore((state) => state.showDetails);
  const showProfitDistribution = useCommitteeDashboardStore((state) => state.showProfitDistribution);
  const expandedRows = useCommitteeDashboardStore((state) => state.expandedRows);
  const openIdeaDetailsById = useCommitteeDashboardStore((state) => state.openIdeaDetails);
  const closeIdeaDetails = useCommitteeDashboardStore((state) => state.closeIdeaDetails);
  const openProfitById = useCommitteeDashboardStore((state) => state.openProfit);
  const closeProfit = useCommitteeDashboardStore((state) => state.closeProfit);
  const toggleRowExpansion = useCommitteeDashboardStore((state) => state.toggleRowExpansion);

  const stats = useMemo(() => {
    const total = ideas.length;
    const inProgress = ideas.filter((item) => item.status === "in_progress").length;
    const pending = ideas.filter((item) => item.status === "pending").length;
    const avgProgress = Math.round(
      ideas.reduce((acc, item) => acc + (item.roadmap?.progress_percentage || 0), 0) / (ideas.length || 1),
    );

    return { total, inProgress, pending, avgProgress };
  }, [ideas]);

  const selectedIdea = useMemo(
    () => ideas.find((idea) => idea.id === selectedIdeaId) || null,
    [ideas, selectedIdeaId],
  );

  const openIdeaDetails = (idea: CommitteeIdea) => {
    openIdeaDetailsById(idea.id);
  };

  const openProfit = (idea: CommitteeIdea) => {
    openProfitById(idea.id);
  };

  const selectedProfit = selectedIdea ? buildProfitSummary(selectedIdea) : null;

  return {
    ideas,
    stats,
    selectedIdea,
    selectedProfit,
    showDetails,
    showProfitDistribution,
    expandedRows,
    openIdeaDetails,
    closeIdeaDetails,
    openProfit,
    closeProfit,
    toggleRowExpansion,
  };
};
