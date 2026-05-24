"use client";

import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import {
	ArrowRight,
	CheckCircle,
	FileText,
	Lock,
	MessageSquare,
	PlayCircle,
	TrendingUp,
} from "lucide-react";

type TimelineCardData = {
	id: number;
	stage_name: string;
	status: "completed" | "current" | "pending";
	progress: number;
	description: string;
	message: string;
	isCurrent: boolean;
	isCompleted: boolean;
	colors: {
		main: string;
		light: string;
		dark: string;
	};
	icon: string;
	animation: object;
	link: {
		url: string;
		label: string;
		description: string;
	};
};

const stageRoles: Record<string, { role: string; badgeColor: string }> = {
	"Idea Submission": {
		role: "Idea Owner",
		badgeColor: "bg-blue-100 text-blue-800 border border-blue-300",
	},
	"Initial Evaluation": {
		role: "Committee",
		badgeColor: "bg-purple-100 text-purple-800 border border-purple-300",
	},
	"Systematic Planning / Business Plan Preparation": {
		role: "Idea Owner",
		badgeColor: "bg-green-100 text-green-800 border border-green-300",
	},
	"Advanced Evaluation Before Funding": {
		role: "Committee",
		badgeColor: "bg-purple-100 text-purple-800 border border-purple-300",
	},
	Funding: {
		role: "Idea Owner + Committee/Investor",
		badgeColor: "bg-yellow-100 text-yellow-800 border border-yellow-300",
	},
	"Execution and Development": {
		role: "Idea Owner + Committee",
		badgeColor: "bg-indigo-100 text-indigo-800 border border-indigo-300",
	},
	Launch: {
		role: "Idea Owner + Committee",
		badgeColor: "bg-pink-100 text-pink-800 border border-pink-300",
	},
	"Post-Launch Follow-up": {
		role: "Idea Owner + Committee",
		badgeColor: "bg-purple-100 text-purple-800 border border-purple-300",
	},
	"Project Stabilization / Platform Separation": {
		role: "Idea Owner + Committee",
		badgeColor: "bg-teal-100 text-teal-800 border border-teal-300",
	},
};

export default function TimelineItem({
	data,
	index,
	ideaId,
	allStages,
}: {
	data: TimelineCardData;
	index: number;
	ideaId: string;
	allStages: TimelineCardData[];
}) {
	const router = useRouter();
	const {
		stage_name,
		colors,
		isCurrent,
		isCompleted,
		link,
		animation,
		message,
	} = data;

	const stageRole =
		stageRoles[stage_name] ||
		({
			role: "Unknown",
			badgeColor: "bg-gray-100 text-gray-800 border border-gray-300",
		} as const);

	const currentStageIndex = allStages.findIndex((stage) => stage.isCurrent);
	const isNextStage = currentStageIndex !== -1 && index === currentStageIndex + 1;
	const isClickable = isCompleted || isCurrent || isNextStage;

	const handleClick = () => {
		if (!isClickable) return;
		if (link?.url) {
			router.push(link.url);
			return;
		}
		router.push(`/ideas/${ideaId}/roadmap?stage=${encodeURIComponent(stage_name)}`);
	};

	const statusInfo = (() => {
		if (isCompleted) {
			return {
				icon: <CheckCircle className="h-8 w-8 text-green-600" />,
				text: "Completed",
				color: "text-green-700",
				bgColor: "bg-green-100",
				badge: "Completed",
			};
		}
		if (isCurrent) {
			return {
				icon: <PlayCircle className="h-8 w-8 animate-pulse text-yellow-600" />,
				text: "In Progress",
				color: "text-yellow-700",
				bgColor: "bg-yellow-100",
				badge: "Active",
			};
		}
		if (isNextStage) {
			return {
				icon: <ArrowRight className="h-8 w-8 animate-pulse text-blue-600" />,
				text: "Next Step",
				color: "text-blue-700",
				bgColor: "bg-blue-100",
				badge: "Next",
			};
		}
		return {
			icon: <Lock className="h-8 w-8 text-gray-400" />,
			text: "Locked",
			color: "text-gray-500",
			bgColor: "bg-gray-100",
			badge: "Locked",
		};
	})();

	const getButtonLabel = () => {
		if (stage_name === "Post-Launch Follow-up") return "View Follow-ups";
		if (stage_name === "Project Stabilization / Platform Separation") {
			return "View Final Report";
		}
		return link?.label || "View Details";
	};

	const getButtonIcon = () => {
		if (stage_name === "Project Stabilization / Platform Separation") {
			return <TrendingUp className="mr-2 h-4 w-4" />;
		}
		if (stage_name === "Post-Launch Follow-up") {
			return <FileText className="mr-2 h-4 w-4" />;
		}
		return null;
	};

	return (
		<div className="relative my-4 flex w-full md:w-1/2 md:justify-end md:pr-14 odd:md:self-end odd:md:justify-start odd:md:pl-14 odd:md:pr-0">
			<div
				className="absolute top-1/2 hidden h-0.5 w-10 -translate-y-1/2 md:block"
				style={{
					backgroundColor: colors.main,
					right: index % 2 === 0 ? "-0.6rem" : "auto",
					left: index % 2 !== 0 ? "-0.6rem" : "auto",
				}}
			/>

			<div
				className={`relative w-full max-w-105 rounded-2xl shadow-lg transition-all duration-300 md:w-97.5 ${
					isClickable
						? "cursor-pointer hover:-translate-y-1 hover:shadow-2xl"
						: "cursor-not-allowed opacity-65"
				} ${isCurrent ? "ring-4 ring-yellow-300/60" : ""} ${
					isCompleted ? "ring-2 ring-green-300" : ""
				} ${isNextStage ? "ring-2 ring-blue-300" : ""}`}
				onClick={handleClick}
				style={{
					background: `linear-gradient(145deg, ${colors.light} 0%, ${colors.main} 100%)`,
					border: `3px solid ${colors.dark}`,
				}}
			>
				<div
					className={`absolute -top-4 left-1/2 z-30 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold ${stageRole.badgeColor}`}
				>
					{stageRole.role}
				</div>

				<div className="relative m-2 rounded-xl bg-white/95 p-5 backdrop-blur-sm">
					{!isClickable && (
						<div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-gray-900/70 backdrop-blur-[2px]">
							<Lock className="mb-2 h-12 w-12 text-white" />
							<span className="text-sm font-bold text-white">Locked</span>
						</div>
					)}

					{isCompleted && (
						<div className="absolute -right-4 -top-4 z-20 rounded-full bg-green-500 p-2 shadow-xl">
							<CheckCircle className="h-7 w-7 text-white" />
						</div>
					)}

					{isNextStage && !isCurrent && !isCompleted && (
						<div className="absolute -right-4 -top-4 z-20 rounded-full bg-blue-500 p-2 shadow-xl">
							<ArrowRight className="h-7 w-7 text-white" />
						</div>
					)}

					<div
						className={`mb-4 h-44 overflow-hidden rounded-lg border-2 border-white shadow ${
							!isClickable ? "grayscale" : ""
						}`}
					>
						<Lottie animationData={animation} loop={isClickable} autoplay className="h-full w-full" />
					</div>

					<div
						className="mb-3 rounded-lg px-3 py-2 text-center text-sm font-extrabold uppercase tracking-wide sm:text-base"
						style={{ backgroundColor: colors.main, color: "#1f2937" }}
					>
						{stage_name}
						<span
							className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusInfo.bgColor} ${statusInfo.color}`}
						>
							{statusInfo.badge}
						</span>
					</div>

					{(isCurrent || isNextStage) && message && (
						<div className="mb-4 rounded-lg border border-blue-200 bg-linear-to-r from-blue-50 to-cyan-50 p-3">
							<div className="mb-1 flex items-center gap-2 text-sm font-semibold text-blue-800">
								{isCurrent ? (
									<MessageSquare className="h-4 w-4" />
								) : (
									<ArrowRight className="h-4 w-4" />
								)}
								{isCurrent ? "Current Stage Guidance" : "Next Step Preview"}
							</div>
							<p className="text-sm leading-relaxed text-blue-700">{message}</p>
						</div>
					)}

					<div className="flex items-center justify-between">
						<div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
							{statusInfo.icon}
							<span>{statusInfo.text}</span>
						</div>

						{isClickable && (
							<button
								onClick={(event) => {
									event.stopPropagation();
									handleClick();
								}}
								className={`inline-flex items-center rounded-lg px-4 py-2 text-xs font-bold text-white shadow transition-colors sm:text-sm ${
									isCurrent
										? "bg-yellow-500 hover:bg-yellow-600"
										: isCompleted
											? "bg-green-500 hover:bg-green-600"
											: "bg-blue-500 hover:bg-blue-600"
								}`}
							>
								{getButtonIcon()}
								{getButtonLabel()}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
