"use client";

import { create } from "zustand";

import { DashboardTabKey } from "../types";

type CommitteeDashboardState = {
  activeTab: DashboardTabKey;
  selectedIdeaId: number | null;
  showDetails: boolean;
  showProfitDistribution: boolean;
  expandedRows: number[];
  setActiveTab: (tab: DashboardTabKey) => void;
  openIdeaDetails: (ideaId: number) => void;
  closeIdeaDetails: () => void;
  openProfit: (ideaId: number) => void;
  closeProfit: () => void;
  toggleRowExpansion: (ideaId: number) => void;
};

export const useCommitteeDashboardStore = create<CommitteeDashboardState>((set) => ({
  activeTab: "ideas",
  selectedIdeaId: null,
  showDetails: false,
  showProfitDistribution: false,
  expandedRows: [],

  // Why Zustand is used here:
  // 1) This state is UI-only but shared by multiple components: sidebar, ideas table, and modal.
  // 2) Lifting this state into parent props would add prop drilling and reduce maintainability.
  // 3) Keeping it local in each component causes desync (for example sidebar tab and table details modal).
  // 4) Zustand keeps this shared state small, explicit, and framework-friendly in Next.js client components.
  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      selectedIdeaId: null,
      showDetails: false,
      showProfitDistribution: false,
    }),

  // Open details by idea id so the latest idea data is always derived from current query data.
 
  openIdeaDetails: (ideaId) =>
    set({
      selectedIdeaId: ideaId,
      showDetails: true,
      showProfitDistribution: false,
    }),
  
  // Profit modal shares selected idea id with details mode for a consistent UX.
openProfit: (ideaId) =>
    set({
      selectedIdeaId: ideaId,
      showProfitDistribution: true,
      showDetails: false,
    }),

 
  closeProfit: () =>
    set({
      showProfitDistribution: false,
      selectedIdeaId: null,
    }),


  closeIdeaDetails: () =>
    set({
      showDetails: false,
      selectedIdeaId: null,
    }),


  toggleRowExpansion: (ideaId) =>
    set((state) => ({
      expandedRows: state.expandedRows.includes(ideaId)
        ? state.expandedRows.filter((id) => id !== ideaId)
        : [...state.expandedRows, ideaId],
    })),

  resetSelection: () =>
    set({
      selectedIdeaId: null,
      showDetails: false,
      showProfitDistribution: false,
    }),
}));

