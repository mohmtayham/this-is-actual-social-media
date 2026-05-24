import { DashboardTabKey } from "../types";

export const committeeTabs: Array<{ key: DashboardTabKey; label: string }> = [
  {key: "ideas", label: "Ideas" },
  {key: "evaluations", label: "Evaluations" },
  {key: "bms", label: "BMCs" },
  {key:"gantt", label:"Gantt"},
  { key: "funding", label: "Funding" },
  { key: "meetings", label: "Meetings" },
  { key: "reports", label: "Reports" },
];
