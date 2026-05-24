// This module is server-only because it calls authFetch/getSession internally.
// Why NOT use "use server" here:
// - "use server" is primarily for Server Actions that are invoked from Client Components.
// - This file is a server data utility imported by Server Components/Route Handlers.
// Best practice: guard utility modules with server-only so they cannot be imported by client code.
import "server-only";

import { authFetch } from "@/lib/authFetch";

export type CommitteeIdeaOwner = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
};

export type CommitteeIdeaRoadmap = {
  current_stage?: string;
  progress_percentage?: number;
  stage_description?: string;
  estimated_completion?: string;
};

export type CommitteeProfitDistribution = {
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
  owner?: CommitteeIdeaOwner;
  roadmap?: CommitteeIdeaRoadmap;
  profitDistributions?: CommitteeProfitDistribution[];
};

export type CommitteeDashboardData = {
  ideas: CommitteeIdea[];
};

const normalizeIdeas = (payload: unknown): CommitteeIdea[] => {
  if (Array.isArray(payload)) {
    return payload as CommitteeIdea[];
  }

  const asObject = payload as { ideas?: CommitteeIdea[]; data?: CommitteeIdea[] } | null;
  if (Array.isArray(asObject?.ideas)) return asObject.ideas;
  if (Array.isArray(asObject?.data)) return asObject.data;

  return [];
};

const mapIdeaShape = (idea: any): CommitteeIdea => ({
  id: idea.id,
  title: idea.title,
  description: idea.description,
  problem: idea.problem,
  solution: idea.solution,
  target_audience: idea.targetAudience || idea.target_audience,
  additional_notes: idea.additionalNotes || idea.additional_notes,
  status: idea.status,
  created_at: idea.createdAt || idea.created_at,
  updated_at: idea.updatedAt || idea.updated_at,
  owner: {
    name: idea.owner?.name,
    email: idea.owner?.email,
    phone: idea.owner?.phone,
    location: idea.owner?.location,
  },
  roadmap: {
    current_stage: idea.roadmap?.currentStage || idea.roadmap?.current_stage || idea.roadmapStage,
    progress_percentage: idea.roadmap?.progressPercentage || idea.roadmap?.progress_percentage || 0,
    stage_description: idea.roadmap?.stageDescription || idea.roadmap?.stage_description,
    estimated_completion: idea.roadmap?.estimatedCompletion || idea.roadmap?.estimated_completion,
  },
  profitDistributions: idea.profitDistributions || [],
});

export const getCommitteeDashboardData = async (): Promise<CommitteeDashboardData> => {
  // Preferred endpoint from old React app.
  try {
  //   const cleanIdeas = 
  //  await authFetch('/ideas');
  //   const ideas = normalizeIdeas(cleanIdeas).map(mapIdeaShape);
//   const response = await authFetch("/ideas");

// if (!response.ok) {
//   throw new Error("Failed to fetch ideas");
// }

const response = await authFetch("/ideas");

const payload = await response.json();

console.log("Committee dashboard payload:", payload);

const ideas = normalizeIdeas(payload).map(mapIdeaShape);

return { ideas };
// const cleanIdeas = await response.json();

// const ideas = normalizeIdeas(cleanIdeas).map(mapIdeaShape);

// return { ideas };
    // return { ideas };
  } catch {
    // Fallback: available endpoint in this backend.
    const fallbackIdeas = await authFetch("/ideas");
    const ideas = normalizeIdeas(fallbackIdeas).map(mapIdeaShape);
    return { ideas };
  }
};
