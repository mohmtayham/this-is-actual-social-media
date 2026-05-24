type DashboardHeaderProps = {
  total: number;
  inProgress: number;
  pending: number;
  avgProgress: number;
};

export default function DashboardHeader({
  total,
  inProgress,
  pending,
  avgProgress,
}: DashboardHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Committee Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Review assigned ideas and track progress.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-slate-500">Total</div>
          <div className="text-xl font-black text-slate-900">{total}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-slate-500">In Progress</div>
          <div className="text-xl font-black text-blue-600">{inProgress}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-slate-500">Pending</div>
          <div className="text-xl font-black text-amber-600">{pending}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-slate-500">Avg Progress</div>
          <div className="text-xl font-black text-orange-600">{avgProgress}%</div>
        </div>
      </div>
    </header>
  );
}
