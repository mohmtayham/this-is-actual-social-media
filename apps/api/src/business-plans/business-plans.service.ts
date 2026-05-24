import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { BusinessPlanStatus, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBusinessPlanDto } from './dto/create-business-plan.dto';
import { UpdateBusinessPlanDto } from './dto/update-business-plan.dto';

@Injectable()
export class BusinessPlansService {
	constructor(private readonly prisma: PrismaService) {}

	private async getUserOrThrow(userId: number) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async create(userId: number, dto: CreateBusinessPlanDto) {
		const user = await this.getUserOrThrow(userId);

		const idea = await this.prisma.idea.findUnique({
			where: { id: dto.ideaId },
			include: {
				businessPlans: true,
			},
		});

		if (!idea) {
			throw new NotFoundException('Idea not found');
		}

		const canCreate = user.role === Role.ADMIN || idea.ownerId === user.id;
		if (!canCreate) {
			throw new ForbiddenException('You do not have permission to create a business plan for this idea');
		}

		const activeStatuses = new Set<BusinessPlanStatus>([
			BusinessPlanStatus.UNDER_REVIEW,
			BusinessPlanStatus.APPROVED,
		]);

		const hasActivePlan = idea.businessPlans.some((plan) => activeStatuses.has(plan.status));

		if (hasActivePlan && user.role !== Role.ADMIN) {
			throw new ConflictException('This idea already has an active business plan');
		}

		const businessPlan = await this.prisma.businessPlan.create({
			data: {
				ideaId: dto.ideaId,
				keyPartners: dto.keyPartners,
				keyActivities: dto.keyActivities,
				keyResources: dto.keyResources,
				valueProposition: dto.valueProposition,
				customerRelationships: dto.customerRelationships,
				channels: dto.channels,
				customerSegments: dto.customerSegments,
				costStructure: dto.costStructure,
				revenueStreams: dto.revenueStreams,
				status: dto.status ?? BusinessPlanStatus.UNDER_REVIEW,
			},
			include: {
				idea: {
					select: {
						id: true,
						title: true,
						ownerId: true,
						committeeId: true,
					},
				},
			},
		});

		return {
			message: 'Business plan created successfully',
			businessPlan,
		};
	}

	async findAll() {
		return this.prisma.businessPlan.findMany({
			include: {
				idea: {
					select: {
						id: true,
						title: true,
						ownerId: true,
						committeeId: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async findMine(userId: number) {
		await this.getUserOrThrow(userId);

		return this.prisma.businessPlan.findMany({
			where: {
				idea: {
					ownerId: userId,
				},
			},
			include: {
				idea: {
					select: {
						id: true,
						title: true,
						ownerId: true,
						committeeId: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async findByIdea(ideaId: number, userId: number) {
		const user = await this.getUserOrThrow(userId);

		const idea = await this.prisma.idea.findUnique({
			where: { id: ideaId },
			include: {
				committee: {
					include: {
						members: true,
					},
				},
			},
		});

		if (!idea) {
			throw new NotFoundException('Idea not found');
		}

		const isCommitteeMember = idea.committee?.members.some((member) => member.userId === user.id) ?? false;

		if (user.role !== Role.ADMIN && idea.ownerId !== user.id && !isCommitteeMember) {
			throw new ForbiddenException('You do not have permission to access business plans for this idea');
		}

		return this.prisma.businessPlan.findMany({
			where: { ideaId },
			include: {
				idea: {
					select: {
						id: true,
						title: true,
						ownerId: true,
						committeeId: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async findOne(id: number, userId: number) {
		const user = await this.getUserOrThrow(userId);

		const businessPlan = await this.prisma.businessPlan.findUnique({
			where: { id },
			include: {
				idea: {
					include: {
						committee: {
							include: {
								members: true,
							},
						},
					},
				},
			},
		});

		if (!businessPlan) {
			throw new NotFoundException('Business plan not found');
		}

		const isCommitteeMember =
			businessPlan.idea.committee?.members.some((member) => member.userId === user.id) ?? false;

		if (
			user.role !== Role.ADMIN &&
			businessPlan.idea.ownerId !== user.id &&
			!isCommitteeMember
		) {
			throw new ForbiddenException('You do not have permission to access this business plan');
		}

		return businessPlan;
	}

	async update(id: number, userId: number, dto: UpdateBusinessPlanDto) {
		const user = await this.getUserOrThrow(userId);

		const businessPlan = await this.prisma.businessPlan.findUnique({
			where: { id },
			include: {
				idea: {
					select: {
						ownerId: true,
					},
				},
			},
		});

		if (!businessPlan) {
			throw new NotFoundException('Business plan not found');
		}

		const canUpdate = user.role === Role.ADMIN || businessPlan.idea.ownerId === user.id;
		if (!canUpdate) {
			throw new ForbiddenException('You do not have permission to update this business plan');
		}

		if (businessPlan.status === BusinessPlanStatus.APPROVED && user.role !== Role.ADMIN) {
			throw new ForbiddenException('Approved business plans can only be updated by admins');
		}

		if (dto.status && user.role === Role.IDEA_OWNER) {
			throw new ForbiddenException('Idea owners cannot directly change business plan status');
		}

		return this.prisma.businessPlan.update({
			where: { id },
			data: {
				...dto,
			},
			include: {
				idea: {
					select: {
						id: true,
						title: true,
						ownerId: true,
						committeeId: true,
					},
				},
			},
		});
	}

	async remove(id: number, userId: number) {
		const user = await this.getUserOrThrow(userId);

		const businessPlan = await this.prisma.businessPlan.findUnique({
			where: { id },
			include: {
				idea: {
					select: {
						ownerId: true,
					},
				},
			},
		});

		if (!businessPlan) {
			throw new NotFoundException('Business plan not found');
		}

		const isOwner = businessPlan.idea.ownerId === user.id;
		const isAdmin = user.role === Role.ADMIN;

		if (!isOwner && !isAdmin) {
			throw new ForbiddenException('You do not have permission to delete this business plan');
		}

		if (businessPlan.status === BusinessPlanStatus.APPROVED && !isAdmin) {
			throw new ForbiddenException('Approved business plans can only be deleted by admins');
		}

		return this.prisma.businessPlan.delete({
			where: { id },
		});
	}
}