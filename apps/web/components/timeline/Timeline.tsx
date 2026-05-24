"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import TimelineItem from "@/components/timeline/TimelineItem";

import BubbleAnimation from "@/assets/animations/buble.json";
import CreativeIdeaAnimation from "@/assets/animations/Creative Idea.json";

type Stage = {
  name: string;
  message_for_owner?: string;
};

type Roadmap = {
  ideaId?: number;
  currentStage?: string;
  progressPercentage?: number;
  nextStep?: string | null;
  lastUpdate?: string;
  idea?: {
    title?: string;
  };
};

type TimelineProps = {
  initialRoadmap: Roadmap;
  stages: Stage[];
  ideaId: string;
};

const STEP_COLORS = [
  { main: "#FFD6BA", light: "#FFE8D6", dark: "#E0B89B" },
  { main: "#FFF9BD", light: "#FFFCE6", dark: "#E6DF9F" },
  { main: "#A3DC9A", light: "#D4F1C5", dark: "#8CC084" },
];

const stageIcons: Record<string, string> = {
  "Idea Submission": "📝",
  "Initial Evaluation": "📋",
  "Systematic Planning / Business Plan Preparation": "📊",
  "Advanced Evaluation Before Funding": "🎯",
  Funding: "💰",
  "Execution and Development": "🚀",
  Launch: "📈",
  "Post-Launch Follow-up": "🔍",
  "Project Stabilization / Platform Separation": "🏆",
};

const timelineAnimations: Record<string, object> = {
  "Idea Submission": BubbleAnimation,
  "Initial Evaluation": BubbleAnimation,
  "Systematic Planning / Business Plan Preparation": CreativeIdeaAnimation,
  "Advanced Evaluation Before Funding": BubbleAnimation,
  Funding: CreativeIdeaAnimation,
  "Execution and Development": CreativeIdeaAnimation,
  Launch: BubbleAnimation,
  "Post-Launch Follow-up": BubbleAnimation,
  "Project Stabilization / Platform Separation": CreativeIdeaAnimation,
};

const getStageLink = (stage: string, ideaId: string) => ({
  url: `/ideas/${ideaId}/roadmap?stage=${encodeURIComponent(stage)}`,
  label: "View Details",
  description: "Stage details",
});

export default function Timeline({ initialRoadmap, stages, ideaId }: TimelineProps) {
  const router = useRouter();

  const timelineData = useMemo(() => {
    const currentStage = initialRoadmap?.currentStage || "Idea Submission";
    const currentStageIndex = stages.findIndex((stage) => stage.name === currentStage);

    return stages.map((stage, idx) => {
      const isCurrent = stage.name === currentStage;
      const isCompleted = idx < (currentStageIndex !== -1 ? currentStageIndex : 0);
      const status: "completed" | "current" | "pending" = isCompleted
        ? "completed"
        : isCurrent
          ? "current"
          : "pending";
      const progress = isCompleted
        ? 100
        : isCurrent
          ? (initialRoadmap?.progressPercentage ?? 0)
          : 0;

      const colors = STEP_COLORS[idx % STEP_COLORS.length];

      return {
        id: idx + 1,
        stage_name: stage.name,
        status,
        progress,
        description: stage.message_for_owner || "",
        colors,
        isCurrent,
        isCompleted,
        message: stage.message_for_owner || "",
        link: getStageLink(stage.name, ideaId),
        icon: stageIcons[stage.name] || "📝",
        animation: timelineAnimations[stage.name] || BubbleAnimation,
      };
    });
  }, [initialRoadmap?.currentStage, initialRoadmap?.progressPercentage, stages, ideaId]);

  const getTimeSinceUpdate = () => {
    if (!initialRoadmap?.lastUpdate) return "Unknown";
    const now = new Date();
    const lastUpdate = new Date(initialRoadmap.lastUpdate);
    const diffInSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/profile")}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-400 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </button>
            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#A3DC9A] px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-[#8CC084]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-linear-to-r from-[#FFD586] to-[#FFE8A5] p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-800">Project Roadmap</h1>
                <p className="text-lg text-gray-600">
                  {initialRoadmap?.idea?.title || "Your idea roadmap and current progress"}
                </p>
              </div>

              <div className="rounded-xl border border-[#FFD6BA] bg-linear-to-r from-[#FFE8D6] to-[#D4F1C5] p-4 text-center shadow-inner">
                <div className="text-3xl font-bold text-gray-800">
                  {Math.max(0, Math.min(100, initialRoadmap?.progressPercentage ?? 0))}%
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Current Progress
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-[#FFF9BD] bg-white/80 p-4">
                <div className="mb-1 text-xs text-gray-500">Current Stage</div>
                <div className="font-semibold text-gray-800">
                  {initialRoadmap?.currentStage || "Idea Submission"}
                </div>
              </div>
              <div className="rounded-lg border border-[#FFD6BA] bg-white/80 p-4">
                <div className="mb-1 text-xs text-gray-500">Last Updated</div>
                <div className="inline-flex items-center gap-2 font-semibold text-gray-800">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {getTimeSinceUpdate()}
                </div>
              </div>
              <div className="rounded-lg border border-[#A3DC9A] bg-white/80 p-4">
                <div className="mb-1 text-xs text-gray-500">Next Step</div>
                <div className="font-semibold text-gray-800">
                  {initialRoadmap?.nextStep || "Follow current stage guidance"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative my-16 flex flex-col">
          <div className="absolute left-1/2 top-0 bottom-0 hidden w-1 -translate-x-1/2 bg-linear-to-b from-gray-400 to-gray-600 shadow-lg md:block" />

          {timelineData.map((data, idx) => (
            <TimelineItem
              key={data.id}
              data={data}
              index={idx}
              ideaId={ideaId}
              allStages={timelineData}
            />
          ))}
        </div>

        <div className="mt-12 rounded-xl border bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">How to Navigate</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                <span className="font-bold text-yellow-700">●</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Current Stage</h4>
                <p className="text-sm text-gray-600">Highlighted and active</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Completed</h4>
                <p className="text-sm text-gray-600">Finished milestones</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <ArrowRight className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Next Step</h4>
                <p className="text-sm text-gray-600">Unlocked preview stage</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Refresh</h4>
                <p className="text-sm text-gray-600">Reload latest roadmap data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
