// This service is server-only because it uses authFetch/session-protected backend calls.
// Why this is not "use server":
// - It is consumed as a server data helper, not exposed as a client-invoked Server Action.
// - server-only prevents accidental client imports and keeps auth logic on the server.
import "server-only";
// how to make this with best practice nextjs using server and client component and usequery and use route and use zustand 

import { authFetch } from "@/lib/authFetch";



export const getIdeaRoadmap = async (ideaId: string) => {
  if (!ideaId) {
    throw new Error("ideaId is undefined ❌");
  }

  const response = await authFetch(`/roadmap/idea/${ideaId}`);
  const data = await response.json();
  return data;
};
export const getPlatformStages = async () => {
  const response = await authFetch("/roadmap/stages"); 
  const data = await response.json();
  return data.platform_roadmap_stages;
};
