"use client";

import { ProfitSummary } from "../../types";

type ProfitDistributionModalProps = {
  open: boolean;
  data: ProfitSummary | null;
  onClose: () => void;
};

const roleBadge = (role?: string) => {
  if (role === "idea_owner") return "bg-blue-100 text-blue-800";
  if (role === "investor") return "bg-purple-100 text-purple-800";
  if (role === "admin") return "bg-red-100 text-red-800";
  if (role === "committee") return "bg-orange-100 text-orange-800";
  return "bg-slate-100 text-slate-700";
};

export default function ProfitDistributionModal({
  open,
  data,
  onClose,
}: ProfitDistributionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Profit Distribution</h2>
            <p className="text-sm text-slate-600">{data?.idea_title || "No selected idea"}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {!data ? (
          <div className="p-10 text-center text-sm font-semibold text-slate-600">
            No profit distribution data available for this idea.
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/90">Idea ID: {data.idea_id}</p>
                  <h3 className="mt-1 text-xl font-black text-white">{data.idea_title}</h3>
                </div>
                <span className="rounded-lg bg-white/20 px-3 py-2 text-sm font-black text-white">
                  {data.profit_distributed ? "Distributed" : "Pending"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">User</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Percentage</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.distributions.map((dist, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{dist.user_name || "Unknown"}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleBadge(dist.role)}`}>
                          {(dist.role || "unknown").replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-slate-900">{dist.percentage ?? 0}%</td>
                      <td className="px-5 py-4 font-black text-green-600">{dist.amount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
