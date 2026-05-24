"use client";

import { DashboardTabKey } from "../../types";
import IdeasTab from "./IdeasTab";
import EvaluationTab from "./EvaluationTab";
import { CommitteeIdea } from "../../types";

type DashboardTabsProps = {
  activeTab: DashboardTabKey;
  ideas: CommitteeIdea[];
};

const EmptyTab = ({ label }: { label: string }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
    <h3 className="text-lg font-bold text-slate-900">{label}</h3>
    <p className="mt-2 text-sm text-slate-600">This module can be implemented next.</p>
  </div>
);

export default function DashboardTabs({ activeTab, ideas }: DashboardTabsProps) {
  if (activeTab === "ideas") {
    return <IdeasTab initialIdeas={ideas} />;
  }

  if (activeTab === "funding") {
    return <EmptyTab label="Funding" />;
  }

  if (activeTab === "meetings") {
    return <EmptyTab label="Meetings" />;
  }

  if (activeTab === "reports") {
  }
  if(activeTab === "gantt"){
    return <EmptyTab label="Gantt" />;
  }
  if(activeTab === "bms"){
    return <EmptyTab label="BMCs" />;
  }
  if(activeTab === "evaluations"){
    return <EvaluationTab />;

  }

  return <EmptyTab label="Reports" />;
}
