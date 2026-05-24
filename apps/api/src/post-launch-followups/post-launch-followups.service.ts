import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FollowupStatus, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostLaunchFollowupDto } from './dto/create-post-launch-followup.dto';
import { UpdatePostLaunchFollowupDto } from './dto/update-post-launch-followup.dto';

@Injectable()
export class PostLaunchFollowupsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserOrThrow(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(dto: CreatePostLaunchFollowupDto) {
    const launchRequest = await this.prisma.launchRequest.findUnique({
      where: { id: dto.launchRequestId },
    });

    if (!launchRequest) {
      throw new NotFoundException('Launch request not found');
    }

    const duplicate = await this.prisma.postLaunchFollowup.findFirst({
      where: {
        launch_request_id: dto.launchRequestId,
        followup_phase: dto.followupPhase,
      },
    });

    if (duplicate) {
      throw new BadRequestException('This follow-up phase already exists for the launch request');
    }

    return this.prisma.postLaunchFollowup.create({
      data: {
        launch_request_id: dto.launchRequestId,
        followup_phase: dto.followupPhase,
        scheduled_date: new Date(dto.scheduledDate),
        status: dto.status ?? FollowupStatus.pending,
      },
      include: {
        launch_request: {
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
        },
      },
    });
  }

  async findMine(userId: number) {
    await this.getUserOrThrow(userId);

    return this.prisma.postLaunchFollowup.findMany({
      where: {
        launch_request: {
          idea: {
            ownerId: userId,
          },
        },
      },
      include: {
        launch_request: {
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
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduled_date: 'asc',
      },
    });
  }

  async findCommitteeQueue(userId: number) {
    const user = await this.getUserOrThrow(userId);

    if (user.role === Role.ADMIN) {
      return this.prisma.postLaunchFollowup.findMany({
        include: {
          launch_request: {
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
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          scheduled_date: 'asc',
        },
      });
    }

    const membership = await this.prisma.committeeMember.findFirst({
      where: { userId: user.id },
    });

    if (!membership) {
      throw new ForbiddenException('Only committee members can access committee follow-up queue');
    }

    return this.prisma.postLaunchFollowup.findMany({
      where: {
        launch_request: {
          idea: {
            committeeId: membership.committeeId,
          },
        },
      },
      include: {
        launch_request: {
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
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduled_date: 'asc',
      },
    });
  }

  async findByLaunchRequest(launchRequestId: number, userId: number) {
    const user = await this.getUserOrThrow(userId);

    const launchRequest = await this.prisma.launchRequest.findUnique({
      where: { id: launchRequestId },
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
      throw new ForbiddenException('You do not have permission to access these follow-ups');
    }

    return this.prisma.postLaunchFollowup.findMany({
      where: {
        launch_request_id: launchRequestId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduled_date: 'asc',
      },
    });
  }

  async findOne(id: number, userId: number) {
    const user = await this.getUserOrThrow(userId);

    const followup = await this.prisma.postLaunchFollowup.findUnique({
      where: { id },
      include: {
        launch_request: {
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
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!followup) {
      throw new NotFoundException('Post-launch follow-up not found');
    }

    const isOwner = followup.launch_request.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    const isCommitteeMember =
      followup.launch_request.idea.committee?.members.some((member) => member.userId === user.id) ?? false;

    if (!isOwner && !isAdmin && !isCommitteeMember) {
      throw new ForbiddenException('You do not have permission to access this follow-up');
    }

    return followup;
  }

  async submitOwnerMetrics(userId: number, id: number, dto: UpdatePostLaunchFollowupDto) {
    const user = await this.getUserOrThrow(userId);

    const followup = await this.prisma.postLaunchFollowup.findUnique({
      where: { id },
      include: {
        launch_request: {
          include: {
            idea: true,
          },
        },
      },
    });

    if (!followup) {
      throw new NotFoundException('Post-launch follow-up not found');
    }

    const isOwner = followup.launch_request.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only the idea owner can submit follow-up metrics');
    }

    if (new Date(followup.scheduled_date) > new Date() && !isAdmin) {
      throw new BadRequestException('Owner metrics can only be submitted on or after the scheduled date');
    }

    if (followup.status === FollowupStatus.done) {
      throw new BadRequestException('This follow-up is already finalized');
    }

    return this.prisma.postLaunchFollowup.update({
      where: { id },
      data: {
        active_users: dto.activeUsers,
        revenue: dto.revenue,
        growth_rate: dto.growthRate,
        owner_response: dto.ownerResponse,
        owner_acknowledged: dto.ownerAcknowledged,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async submitCommitteeReview(userId: number, id: number, dto: UpdatePostLaunchFollowupDto) {
    const user = await this.getUserOrThrow(userId);

    const followup = await this.prisma.postLaunchFollowup.findUnique({
      where: { id },
      include: {
        launch_request: {
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
        },
      },
    });

    if (!followup) {
      throw new NotFoundException('Post-launch follow-up not found');
    }

    const isAdmin = user.role === Role.ADMIN;
    const isCommitteeMember =
      followup.launch_request.idea.committee?.members.some((member) => member.userId === user.id) ?? false;

    if (!isAdmin && !isCommitteeMember) {
      throw new ForbiddenException('Only committee members or admins can review follow-ups');
    }

    if (new Date(followup.scheduled_date) > new Date()) {
      throw new BadRequestException('Follow-up cannot be reviewed before its scheduled date');
    }

    if (
      followup.active_users === null ||
      followup.revenue === null ||
      followup.growth_rate === null
    ) {
      throw new BadRequestException('Owner metrics must be submitted before committee review');
    }

    const updatedFollowup = await this.prisma.postLaunchFollowup.update({
      where: { id },
      data: {
        performance_status: dto.performanceStatus,
        risk_level: dto.riskLevel,
        risk_description: dto.riskDescription,
        committee_decision: dto.committeeDecision,
        actions_taken: dto.actionsTaken,
        committee_notes: dto.committeeNotes,
        marketing_support_given: dto.marketingSupportGiven,
        product_issue_detected: dto.productIssueDetected,
        is_stable: dto.isStable,
        profit_distributed: dto.profitDistributed,
        graduation_date: dto.graduationDate ? new Date(dto.graduationDate) : undefined,
        reviewed_by: user.id,
        status: FollowupStatus.done,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (
      dto.evaluationScore !== undefined ||
      dto.strengths !== undefined ||
      dto.weaknesses !== undefined ||
      dto.recommendations !== undefined
    ) {
      await this.prisma.report.upsert({
        where: {
          ideaId_reportType: {
            ideaId: followup.launch_request.ideaId,
            reportType: 'post_launch_followup',
          },
        },
        update: {
          evaluationScore: dto.evaluationScore,
          strengths: dto.strengths,
          weaknesses: dto.weaknesses,
          recommendations: dto.recommendations,
          status: 'done',
        },
        create: {
          ideaId: followup.launch_request.ideaId,
          reportType: 'post_launch_followup',
          evaluationScore: dto.evaluationScore,
          strengths: dto.strengths,
          weaknesses: dto.weaknesses,
          recommendations: dto.recommendations,
          status: 'done',
        },
      });
    }

    return {
      message: 'Follow-up reviewed successfully',
      followup: updatedFollowup,
    };
  }

  async remove(id: number, userId: number) {
    const user = await this.getUserOrThrow(userId);

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete post-launch follow-ups');
    }

    const followup = await this.prisma.postLaunchFollowup.findUnique({ where: { id } });
    if (!followup) {
      throw new NotFoundException('Post-launch follow-up not found');
    }

    return this.prisma.postLaunchFollowup.delete({ where: { id } });
  }
}