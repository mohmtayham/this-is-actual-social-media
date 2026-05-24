import { BusinessPlanStatus } from '@prisma/client';

export class BusinessPlan {
	id: number;
	ideaId: number;
	keyPartners?: string | null;
	keyActivities?: string | null;
	keyResources?: string | null;
	valueProposition?: string | null;
	customerRelationships?: string | null;
	channels?: string | null;
	customerSegments?: string | null;
	costStructure?: string | null;
	revenueStreams?: string | null;
	status: BusinessPlanStatus;
	latestScore?: number | null;
	createdAt: Date;
	updatedAt: Date;
}
