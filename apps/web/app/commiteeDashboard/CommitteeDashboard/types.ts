export type StatusKey =
  | "pending"
  | "approved"
  | "rejected"
  | "in_progress"
  | "under_review"
  | "completed";

export type StageKey =
  | "idea_conception"
  | "market_research"
  | "prototype_development"
  | "testing_phase"
  | "launch_preparation"
  | "post_launch"
  | "execution_and_development";

export type IdeaOwner = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
};

export type IdeaRoadmap = {
  current_stage?: string;
  progress_percentage?: number;
  stage_description?: string;
  estimated_completion?: string;
};

export type DistributionItem = {
  user_name?: string;
  role?: string;
  percentage?: number;
  amount?: number;
};

export type CommitteeIdea = {
  id: number;
  title: string;
  description?: string;
  problem?: string;
  solution?: string;
  target_audience?: string;
  additional_notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  owner?: IdeaOwner;
  roadmap?: IdeaRoadmap;
  profitDistributions?: DistributionItem[];
};
export type EvaluationIdea={

evaluatescore?: number;
 description: string ;
   strengths: string ;
  weaknesses: string;
   recommendations: string

}


export type ProfitSummary = {
  idea_id: number;
  idea_title: string;
  profit_distributed: boolean;
  distributions: DistributionItem[];
};

export type DashboardTabKey = "ideas" | "funding" | "meetings" | "reports" | "gantt" | "bms" | "evaluations";
