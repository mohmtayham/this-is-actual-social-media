import { authFetch } from "@/lib/authFetch";







export const FetchIdeaReport = async (ideaId: number) => {
    if (!ideaId) {
        throw new Error("ideaId is undefined ❌");
    }

    const data = await authFetch(`/reports/idea/${ideaId}`);
    return data;
};



// export const getIdeaRoadmap = async (ideaId: string) => {
//   if (!ideaId) {
//     throw new Error("ideaId is undefined ❌");
//   }

//   const data = await authFetch(`/roadmap/idea/${ideaId}`);
//   return data;
// };
// export const getPlatformStages = async () => {
//   const data = await authFetch("/roadmap/stages"); 
//   return data.platform_roadmap_stages;
// };