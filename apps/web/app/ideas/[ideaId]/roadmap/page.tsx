import { getIdeaRoadmap, getPlatformStages } from "@/services/roadmapService";
import Timeline from "@/components/timeline/Timeline";

export default async function Page({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = await params;
  const roadmap = await getIdeaRoadmap(ideaId);
  const stages = await getPlatformStages();

  return <Timeline initialRoadmap={roadmap} stages={stages} ideaId={ideaId} />;
}