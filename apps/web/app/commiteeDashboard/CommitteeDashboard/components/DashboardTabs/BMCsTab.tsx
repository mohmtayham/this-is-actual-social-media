"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";

type EvaluationIdea = {
  id: number;
  title: string;
  description?: string;
  status?: string;
  initial_evaluation_score?: number;
  initialEvaluationScore?: number;
};

type EvaluationReport = {
  report_id: number;
  report_type?: string;
  description?: string;
  evaluationScore?: number;
  evaluation_score?: number;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  created_at?: string;
};

type IdeaReportsResponse = {
  idea?: { id?: number; title?: string; status?: string };
  total_reports?: number;
  reports?: EvaluationReport[];
};

type EvaluationFormData = {
  evaluation_score: string;
  description: string;
  strengths: string;
  weaknesses: string;
  recommendations: string;
};

const mapStatusLabel = (status?: string) => {
  const value = String(status || "").toUpperCase();
  if (value === "APPROVED") return "Approved";
  if (value === "NEEDS_REVISION") return "Needs Revision";
  if (value === "REJECTED") return "Rejected";
  if (value === "UNDER_REVIEW") return "Under Review";
  if (value === "SUBMITTED") return "Submitted";
  return status || "Unknown";
};

const statusBadgeClass = (status?: string) => {
  const value = String(status || "").toUpperCase();
  if (value === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (value === "NEEDS_REVISION") return "bg-amber-100 text-amber-700";
  if (value === "REJECTED") return "bg-red-100 text-red-700";
  if (value === "UNDER_REVIEW") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
};

const reportTypeLabel = (type?: string) => {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "initial") return "Initial";
  if (normalized === "advanced") return "Advanced";
  return type || "General";
};

export default function BMCsTab() {
  const queryClient = useQueryClient();

  const [selectedIdea, setSelectedIdea] = useState<EvaluationIdea | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationFormData>({
    evaluation_score: "",
    description: "",
    strengths: "",
    weaknesses: "",
    recommendations: "",
  });
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [ideaReports, setIdeaReports] = useState<IdeaReportsResponse | null>(null);

  const openEvaluation = (idea: EvaluationIdea) => {
    setSelectedIdea(idea);
    setEvaluationData({
      evaluation_score:
        idea.initialEvaluationScore?.toString() ||
        idea.initial_evaluation_score?.toString() ||
        "",
      description: "",
      strengths: "",
      weaknesses: "",
      recommendations: "",
    });
    setShowEvaluationModal(true);
  };

  const updateEvaluationData = (updates: Partial<EvaluationFormData>) => {
    setEvaluationData((prev) => ({ ...prev, ...updates }));
  };

  const closeEvaluation = () => {
    setShowEvaluationModal(false);
    setSelectedIdea(null);
  };

  const closeReports = () => {
    setShowReportsModal(false);
    setIdeaReports(null);
  };

  const { data, isLoading, isError } = useQuery<{ ideas: EvaluationIdea[] }>({
    queryKey: ["committee-dashboard", "evaluation-ideas"],
    queryFn: async () => {
      const response = await fetch("/api/committee-dashboard/evaluations", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch evaluation ideas");
      }

      return response.json();
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const ideas = data?.ideas || [];

  const submitMutation = useMutation({
    mutationFn: async ({
      ideaId,
      payload,
    }: {
      ideaId: number;
      payload: {
        evaluation_score: number;
        description: string;
        strengths: string;
        weaknesses: string;
        recommendations: string;
      };
    }) => {
      const response = await fetch(`/api/committee-dashboard/evaluations/${ideaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(error.message || "Failed to submit evaluation");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["committee-dashboard", "evaluation-ideas"],
      });
      queryClient.invalidateQueries({ queryKey: ["committee-dashboard", "ideas"] });
      closeEvaluation();
    },
    onError: () => {
      // Keep UI fallback minimal; form remains open so user can adjust and retry.
    },
  });

  const fetchIdeaReports = async (ideaId: number) => {
    const response = await fetch(
      `/api/committee-dashboard/evaluations/${ideaId}/reports`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reports");
    }

    const payload = (await response.json()) as IdeaReportsResponse;
    setIdeaReports(payload);
    setShowReportsModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Business Model Canvas</h2>
        <p className="text-sm text-slate-500">
          Review assigned ideas, submit initial committee evaluations, and inspect
          generated reports.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load evaluation ideas.
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea) => {
            const score =
              idea.initialEvaluationScore ?? idea.initial_evaluation_score;
            return (
              <article
                key={idea.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(idea.status)}`}
                  >
                    {mapStatusLabel(idea.status)}
                  </span>
                  {typeof score === "number" ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-700">
                      <Star className="h-4 w-4 fill-orange-600 text-orange-600" />
                      {score}
                    </span>
                  ) : null}
               </div>

                <h3 className="text-lg font-bold text-slate-900">{idea.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {idea.description || "No description provided."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void fetchIdeaReports(idea.id);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4" />
                    Reports
                  </button>

                  <button
                    type="button"
                    onClick={() => openEvaluation(idea)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Evaluate
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {showEvaluationModal && selectedIdea ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Initial Evaluation</h3>
                <p className="text-sm text-slate-500">{selectedIdea.title}</p>
              </div>
              <button
                type="button"
                onClick={closeEvaluation}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
              <label className="block text-sm font-semibold text-slate-700">
                Score (0-100)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={evaluationData.evaluation_score}
                  onChange={(event) =>
                    updateEvaluationData({ evaluation_score: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Description
                <textarea
                  value={evaluationData.description}
                  onChange={(event) =>
                    updateEvaluationData({ description: event.target.value })
                  }
                  className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Strengths
                <textarea
                  value={evaluationData.strengths}
                  onChange={(event) =>
                    updateEvaluationData({ strengths: event.target.value })
                  }
                  className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Weaknesses
                <textarea
                  value={evaluationData.weaknesses}
                  onChange={(event) =>
                    updateEvaluationData({ weaknesses: event.target.value })
                  }
                  className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Recommendations
                <textarea
                  value={evaluationData.recommendations}
                  onChange={(event) =>
                    updateEvaluationData({ recommendations: event.target.value })
                  }
                  className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={closeEvaluation}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitMutation.isPending || !evaluationData.evaluation_score}
                onClick={() => {
                  const score = Number(evaluationData.evaluation_score);
                  if (!selectedIdea?.id || !Number.isFinite(score)) {
                    return;
                  }

                  submitMutation.mutate({
                    ideaId: selectedIdea.id,
                    payload: {
                      evaluation_score: score,
                      description: evaluationData.description,
                      strengths: evaluationData.strengths,
                      weaknesses: evaluationData.weaknesses,
                      recommendations: evaluationData.recommendations,
                    },
                  });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showReportsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Evaluation Reports</h3>
                <p className="text-sm text-slate-500">
                  {ideaReports?.idea?.title || "Idea reports"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeReports}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
              {(ideaReports?.reports || []).length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No reports available for this idea.
                </div>
              ) : (
                (ideaReports?.reports || []).map((report) => {
                    const reportScore =
                      report.evaluationScore ?? report.evaluation_score;
                    return (
                      <article
                        key={report.report_id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            {reportTypeLabel(report.report_type)} Report
                          </span>
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {report.created_at
                                ? new Date(report.created_at).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {typeof reportScore === "number" ? (
                          <p className="mb-2 text-sm font-bold text-orange-700">
                            Score: {reportScore}
                          </p>
                        ) : null}

                        <p className="text-sm text-slate-700">
                          {report.description || "No report description."}
                        </p>

                        {report.strengths ||
                        report.weaknesses ||
                        report.recommendations ? (
                          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
                              <p className="font-bold">Strengths</p>
                              <p>{report.strengths || "-"}</p>
                            </div>
                            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-800">
                              <p className="font-bold">Weaknesses</p>
                              <p>{report.weaknesses || "-"}</p>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                              <p className="font-bold">Recommendations</p>
                              <p>{report.recommendations || "-"}</p>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      ) : null}

      {submitMutation.isError ? (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          <AlertCircle className="h-4 w-4" />
          {(submitMutation.error as Error).message ||
            "Failed to submit evaluation"}
        </div>
      ) : null}
    </div>
  );
}
