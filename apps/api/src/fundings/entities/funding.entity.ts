export class Funding {
	id: number;
	requestedAmount: number;
	approvedAmount?: number | null;
	justification?: string | null;
	status: string;
	committeeNotes?: string | null;
	ideaId: number;
	ganttId?: number | null;
	taskId?: number | null;
	createdAt: Date;
}
