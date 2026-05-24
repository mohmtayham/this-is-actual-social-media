import { LaunchRequestStatus } from '@prisma/client';

export class LaunchRequest {
	id: number;
	ideaId: number;
	version?: number | null;
	executionSteps?: string | null;
	marketingStrategy?: string | null;
	riskMitigation?: string | null;
	founderCommitment: boolean;
	status: LaunchRequestStatus;
	committeeNotes?: string | null;
	approvedById?: number | null;
	approvedAt?: Date | null;
	launchDate?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}
