export class GanttChart {
	id: number;
	ideaId: number;
	phaseName: string;
	startDate: Date;
	endDate: Date;
	progress: number;
	failureCount: number;
	approvalStatus: string;
	evaluationComments?: string | null;
}
