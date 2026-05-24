import {
  CommitteeDecision,
  FollowupPhase,
  FollowupStatus,
  PerformanceStatus,
  RiskLevel,
} from '@prisma/client';

export class PostLaunchFollowup {
  id: number;
  launch_request_id: number;
  followup_phase: FollowupPhase;
  scheduled_date: Date;
  status: FollowupStatus;
  active_users?: number | null;
  revenue?: number | null;
  growth_rate?: number | null;
  performance_status?: PerformanceStatus | null;
  risk_level?: RiskLevel | null;
  risk_description?: string | null;
  committee_decision?: CommitteeDecision | null;
  owner_response?: string | null;
  owner_acknowledged: boolean;
  marketing_support_given: boolean;
  product_issue_detected: boolean;
  actions_taken?: string | null;
  committee_notes?: string | null;
  is_stable: boolean;
  profit_distributed: boolean;
  graduation_date?: Date | null;
  reviewed_by?: number | null;
  created_at: Date;
  updated_at: Date;
}