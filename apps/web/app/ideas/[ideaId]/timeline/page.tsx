// app/ideas/[ideaId]/timeline/page.tsx

import { getIdeaRoadmap, getPlatformStages } from "@/services/roadmapService";
import Timeline from "@/components/timeline/Timeline";

export default async function Page({ params }: { params: { ideaId: string } }) {
  const roadmap = await getIdeaRoadmap(params.ideaId);
  const stages = await getPlatformStages();

  return (
    <Timeline
      initialRoadmap={roadmap}
      stages={stages}
      ideaId={params.ideaId}
    />
  );
}