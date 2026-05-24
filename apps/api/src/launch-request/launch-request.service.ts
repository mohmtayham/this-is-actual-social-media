import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LaunchRequestStatus, Role } from '@prisma/client';
import { CreateLaunchRequestDto } from './dto/create-launch-request.dto';
import { UpdateLaunchRequestDto } from './dto/update-launch-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LaunchRequestService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserOrThrow(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(userId: number, ideaId: number, dto: CreateLaunchRequestDto) {
    const user = await this.getUserOrThrow(userId);

    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        committee: {
          include: {
            members: true,
          },
        },
        reports: true,
        ganttCharts: true,
      },
    });

    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    const isOwner = idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to create launch requests for this idea');
    }

    const hasUnreviewedReports = idea.reports.some((report) => report.evaluationScore === null);
    if (hasUnreviewedReports) {
      throw new BadRequestException('All idea reports must be evaluated before requesting launch');
    }

    const hasIncompleteGantt = idea.ganttCharts.length > 0 && idea.ganttCharts.some((gantt) => gantt.progress < 90);
    if (hasIncompleteGantt) {
      throw new BadRequestException('All gantt phases must reach at least 90% progress before launch request');
    }

    const existingRequest = await this.prisma.launchRequest.findFirst({
      where: {
        ideaId,
        status: {
          in: [
            LaunchRequestStatus.SUBMITTED,
            LaunchRequestStatus.UNDER_REVIEW,
            LaunchRequestStatus.APPROVED,
          ],
        },
      },
    });

    if (existingRequest) {
      throw new BadRequestException('This idea already has an active launch request');
    }

    const latestVersion = await this.prisma.launchRequest.aggregate({
      where: { ideaId },
      _max: {
        version: true,
      },
    });

    return this.prisma.launchRequest.create({
      data: {
        ideaId,
        status: LaunchRequestStatus.SUBMITTED,
        executionSteps: dto.executionSteps,
        marketingStrategy: dto.marketingStrategy,
        riskMitigation: dto.riskMitigation,
        founderCommitment: dto.founderCommitment ?? false,
        version: (latestVersion._max.version ?? 0) + 1,
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

  async findAll() {
    return this.prisma.launchRequest.findMany({
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            committeeId: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            postLaunchFollowups: true,
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

    return this.prisma.launchRequest.findMany({
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
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
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

    const launchRequest = await this.prisma.launchRequest.findUnique({
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
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        postLaunchFollowups: true,
      },
    });

    if (!launchRequest) {
      throw new NotFoundException('Launch request not found');
    }

    const isOwner = launchRequest.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    const isCommitteeMember =
      launchRequest.idea.committee?.members.some((member) => member.userId === user.id) ?? false;

    if (!isOwner && !isAdmin && !isCommitteeMember) {
      throw new ForbiddenException('You do not have permission to access this launch request');
    }

    return launchRequest;
  }

  async update(id: number, userId: number, dto: UpdateLaunchRequestDto) {
    const user = await this.getUserOrThrow(userId);

    const launchRequest = await this.prisma.launchRequest.findUnique({
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

    if (!launchRequest) {
      throw new NotFoundException('Launch request not found');
    }

    const isOwner = launchRequest.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    const isCommitteeMember =
      launchRequest.idea.committee?.members.some((member) => member.userId === user.id) ?? false;

    if (!isOwner && !isAdmin && !isCommitteeMember) {
      throw new ForbiddenException('You do not have permission to update this launch request');
    }

    const includesCommitteeDecisionFields =
      dto.status !== undefined || dto.committeeNotes !== undefined || dto.launchDate !== undefined;

    if (includesCommitteeDecisionFields && !isAdmin && !isCommitteeMember) {
      throw new ForbiddenException('Only committee members or admins can review launch requests');
    }

    if (!isAdmin && !isCommitteeMember && dto.status !== undefined) {
      throw new ForbiddenException('Idea owners cannot set launch request status directly');
    }

    if (!isAdmin && !isOwner && !isCommitteeMember) {
      throw new ForbiddenException('You do not have permission to update this launch request');
    }

    const data: {
      executionSteps?: string;
      marketingStrategy?: string;
      riskMitigation?: string;
      founderCommitment?: boolean;
      status?: LaunchRequestStatus;
      committeeNotes?: string;
      launchDate?: Date;
      approvedById?: number | null;
      approvedAt?: Date | null;
    } = {};

    if (dto.executionSteps !== undefined) data.executionSteps = dto.executionSteps;
    if (dto.marketingStrategy !== undefined) data.marketingStrategy = dto.marketingStrategy;
    if (dto.riskMitigation !== undefined) data.riskMitigation = dto.riskMitigation;
    if (dto.founderCommitment !== undefined) data.founderCommitment = dto.founderCommitment;

    if (dto.committeeNotes !== undefined) {
      data.committeeNotes = dto.committeeNotes;
    }

    if (dto.launchDate !== undefined) {
      data.launchDate = new Date(dto.launchDate);
    }

    if (dto.status !== undefined) {
      data.status = dto.status;

      if (dto.status === LaunchRequestStatus.APPROVED) {
        data.approvedById = user.id;
        data.approvedAt = new Date();
      }

      if (dto.status === LaunchRequestStatus.REJECTED || dto.status === LaunchRequestStatus.HALTED) {
        data.approvedById = null;
        data.approvedAt = null;
      }
    }

    return this.prisma.launchRequest.update({
      where: { id },
      data,
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            committeeId: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    const user = await this.getUserOrThrow(userId);

    const launchRequest = await this.prisma.launchRequest.findUnique({
      where: { id },
      include: {
        idea: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!launchRequest) {
      throw new NotFoundException('Launch request not found');
    }

    const isOwner = launchRequest.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this launch request');
    }

    if (
      !isAdmin &&
      ![LaunchRequestStatus.SUBMITTED, LaunchRequestStatus.REJECTED].includes(launchRequest.status as any)
    ) {
      throw new ForbiddenException('Only submitted or rejected launch requests can be deleted by owners');
    }

    return this.prisma.launchRequest.delete({
      where: { id },
    });
  }

}






