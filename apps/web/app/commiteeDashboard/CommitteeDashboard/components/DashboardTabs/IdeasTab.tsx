"use client";

import { CommitteeIdea } from "../../types";
import { useCommitteeIdeas } from "../../hooks/useCommitteeIdeas";
import ProfitDistributionModal from "../Modals/ProfitDistributionModal";

type IdeasTabProps = {
  initialIdeas: CommitteeIdea[];
};

const statusBadge = (status?: string) => {
  const value = status || "pending";
  const config: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    approved: "bg-green-100 text-green-800 border border-green-200",
    rejected: "bg-red-100 text-red-800 border border-red-200",
    in_progress: "bg-blue-100 text-blue-800 border border-blue-200",
    under_review: "bg-purple-100 text-purple-800 border border-purple-200",
    completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  };
  return config[value] || "bg-slate-100 text-slate-700 border border-slate-200";
};

const stageBadge = (stage?: string) => {
  const value = stage || "idea_conception";
  const config: Record<string, string> = {
    idea_conception: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    market_research: "bg-blue-50 text-blue-700 border border-blue-200",
    prototype_development: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    testing_phase: "bg-amber-50 text-amber-700 border border-amber-200",
    launch_preparation: "bg-orange-50 text-orange-700 border border-orange-200",
    post_launch: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    execution_and_development: "bg-teal-50 text-teal-700 border border-teal-200",
  };
  return config[value] || "bg-slate-50 text-slate-700 border border-slate-200";
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function ProgressBar({ percentage }: { percentage?: number }) {
  const value = percentage || 0;
  const color = value >= 70 ? "bg-green-500" : value >= 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="min-w-10 text-right text-sm font-bold text-slate-700">{value}%</span>
    </div>
  );
}

export default function IdeasTab({ initialIdeas }: IdeasTabProps) {
  const {
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
  } = useCommitteeIdeas(initialIdeas);

  if (showDetails && selectedIdea) {
    return (
      <div className="space-y-6">
        <ProfitDistributionModal open={showProfitDistribution} data={selectedProfit} onClose={closeProfit} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={closeIdeaDetails}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Back
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Idea Details</h2>
              <p className="text-sm text-slate-600">Detailed committee view for this idea.</p>
            </div>
          </div>

          <button
            onClick={() => openProfit(selectedIdea)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
          >
            View Profit Distribution
          </button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 p-6">
            <h3 className="text-2xl font-black text-white">{selectedIdea.title}</h3>
            <p className="mt-1 text-sm text-orange-100">{selectedIdea.description || "No description"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge(selectedIdea.status)}`}>
                {(selectedIdea.status || "pending").replace(/_/g, " ").toUpperCase()}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">ID {selectedIdea.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-1">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Owner</p>
                <p className="mt-1 font-bold text-slate-900">{selectedIdea.owner?.name || "Unknown"}</p>
                <p className="text-sm text-slate-600">{selectedIdea.owner?.email || "No email"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Progress</p>
                <div className="mt-2">
                  <ProgressBar percentage={selectedIdea.roadmap?.progress_percentage || 0} />
                </div>
                <div className="mt-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${stageBadge(selectedIdea.roadmap?.current_stage)}`}>
                    {(selectedIdea.roadmap?.current_stage || "not_set").replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Timeline</p>
                <p className="mt-1 text-sm text-slate-700">Created: {formatDate(selectedIdea.created_at)}</p>
                <p className="text-sm text-slate-700">Updated: {formatDate(selectedIdea.updated_at)}</p>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Problem Statement</p>
                <p className="mt-2 text-slate-700">{selectedIdea.problem || "Not provided"}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Solution</p>
                <p className="mt-2 text-slate-700">{selectedIdea.solution || "Not provided"}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Target Audience</p>
                <p className="mt-2 text-slate-700">{selectedIdea.target_audience || "Not specified"}</p>
              </article>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfitDistributionModal open={showProfitDistribution} data={selectedProfit} onClose={closeProfit} />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-black text-slate-900">Assigned Ideas</h2>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>Total: <strong className="text-orange-600">{stats.total}</strong></span>
          <span>In Progress: <strong className="text-blue-600">{stats.inProgress}</strong></span>
          <span>Pending: <strong className="text-amber-600">{stats.pending}</strong></span>
          <span>Avg Progress: <strong className="text-orange-600">{stats.avgProgress}%</strong></span>
        </div>
      </section>

      {ideas.length === 0 ? (
        <section className="rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <h3 className="text-xl font-bold text-slate-900">No Ideas Assigned</h3>
          <p className="mt-2 text-slate-600">You do not have ideas assigned yet.</p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
            <span className="col-span-1 text-xs font-bold uppercase text-slate-600">ID</span>
            <span className="col-span-2 text-xs font-bold uppercase text-slate-600">Title</span>
            <span className="col-span-2 text-xs font-bold uppercase text-slate-600">Owner</span>
            <span className="col-span-1 text-xs font-bold uppercase text-slate-600">Status</span>
            <span className="col-span-2 text-xs font-bold uppercase text-slate-600">Stage</span>
            <span className="col-span-2 text-xs font-bold uppercase text-slate-600">Progress</span>
            <span className="col-span-2 text-xs font-bold uppercase text-slate-600">Actions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {ideas.map((idea) => (
              <div key={idea.id}>
                <div className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-slate-50">
                  <div className="col-span-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-orange-400 to-orange-600 text-xs font-bold text-white">
                      {idea.id}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="line-clamp-1 text-sm font-bold text-slate-900">{idea.title}</p>
                    <p className="line-clamp-1 text-xs text-slate-500">{idea.description}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-900">{idea.owner?.name || "Unknown"}</p>
                    <p className="truncate text-xs text-slate-500">{idea.owner?.email || "No email"}</p>
                  </div>

                  <div className="col-span-1">
                    <span className={`inline-flex rounded px-2 py-1 text-xs font-bold ${statusBadge(idea.status)}`}>
                      {(idea.status || "pending").replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className={`inline-flex rounded px-2 py-1 text-xs font-bold ${stageBadge(idea.roadmap?.current_stage)}`}>
                      {(idea.roadmap?.current_stage || "not_set").replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <ProgressBar percentage={idea.roadmap?.progress_percentage || 0} />
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <button
                      onClick={() => openIdeaDetails(idea)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => openProfit(idea)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
                    >
                      Profits
                    </button>
                  </div>
                </div>

                {expandedRows.includes(idea.id) && (
                  <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase text-slate-500">Problem</p>
                        <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                          {idea.problem || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase text-slate-500">Solution</p>
                        <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                          {idea.solution || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 bg-slate-50 px-6 py-2 text-center">
                  <button
                    onClick={() => toggleRowExpansion(idea.id)}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    {expandedRows.includes(idea.id) ? "Show Less" : "Show More Details"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
