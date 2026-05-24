"use client";

import { committeeTabs } from "../../data/committee-tabs";
import { useCommitteeDashboardStore } from "../../store/useCommitteeDashboardStore";

export default function DashboardSidebar() {
  // Why Zustand is consumed directly in this sidebar:
  // 1) Sidebar is the source of tab switching actions.
  // 2) Reading from shared store keeps sidebar and content panel always in sync.
  // 3) This removes extra props and makes the component reusable in dashboard layouts.
  const activeTab = useCommitteeDashboardStore((state) => state.activeTab);
  const setActiveTab = useCommitteeDashboardStore((state) => state.setActiveTab);

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 px-2 pt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        Modules
      </div>

      <nav className="space-y-1">
        {committeeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-orange-500 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
