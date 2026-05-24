import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CreateGanttChartDto } from './dto/create-gantt-chart.dto';
import { UpdateGanttChartDto } from './dto/update-gantt-chart.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GanttChartsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserOrThrow(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private validateDateRange(startDate: string | Date, endDate: string | Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }
  }

  private async assertIdeaAccess(ideaId: number, userId: number) {
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

    const isOwner = idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    const isCommitteeMember = idea.committee?.members.some((member) => member.userId === user.id) ?? false;

    return {
      user,
      idea,
      isOwner,
      isAdmin,
      isCommitteeMember,
    };
  }

  async create(userId: number, createGanttChartDto: CreateGanttChartDto) {
    this.validateDateRange(createGanttChartDto.startDate, createGanttChartDto.endDate);

    const access = await this.assertIdeaAccess(createGanttChartDto.ideaId, userId);
    if (!access.isOwner && !access.isAdmin && !access.isCommitteeMember) {
      throw new ForbiddenException('You do not have permission to create gantt phases for this idea');
    }

    return this.prisma.ganttChart.create({
      data: {
        ideaId: createGanttChartDto.ideaId,
        phaseName: createGanttChartDto.phaseName,
        startDate: new Date(createGanttChartDto.startDate),
        endDate: new Date(createGanttChartDto.endDate),
        progress: createGanttChartDto.progress ?? 0,
        failureCount: createGanttChartDto.failureCount ?? 0,
        approvalStatus: createGanttChartDto.approvalStatus ?? 'pending',
      },
      include: {
        idea: true,
        tasks: true,
      },
    });
  }

  async findAll() {
    return this.prisma.ganttChart.findMany({
      include: {
        idea: true,
        tasks: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const ganttChart = await this.prisma.ganttChart.findUnique({
      where: { id },
      include: {
        idea: true,
        tasks: true,
      },
    });

    if (!ganttChart) {
      throw new NotFoundException('Gantt chart not found');
    }

    return ganttChart;
  }

  async update(id: number, userId: number, updateGanttChartDto: UpdateGanttChartDto) {
    const existingGanttChart = await this.prisma.ganttChart.findUnique({
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

    if (!existingGanttChart) {
      throw new NotFoundException('Gantt chart not found');
    }

    const user = await this.getUserOrThrow(userId);
    const isOwner = existingGanttChart.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    const isCommitteeMember =
      existingGanttChart.idea.committee?.members.some((member) => member.userId === user.id) ?? false;

    if (!isOwner && !isAdmin && !isCommitteeMember) {
      throw new ForbiddenException('You do not have permission to update this gantt chart');
    }

    const startDate = updateGanttChartDto.startDate ?? existingGanttChart.startDate;
    const endDate = updateGanttChartDto.endDate ?? existingGanttChart.endDate;
    this.validateDateRange(startDate, endDate);

    return this.prisma.ganttChart.update({
      where: { id },
      data: {
        phaseName: updateGanttChartDto.phaseName,
        startDate: updateGanttChartDto.startDate ? new Date(updateGanttChartDto.startDate) : undefined,
        endDate: updateGanttChartDto.endDate ? new Date(updateGanttChartDto.endDate) : undefined,
        progress: updateGanttChartDto.progress,
        failureCount: updateGanttChartDto.failureCount,
        approvalStatus: updateGanttChartDto.approvalStatus,
      },
      include: {
        idea: true,
        tasks: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    const existingGanttChart = await this.prisma.ganttChart.findUnique({
      where: { id },
      include: {
        idea: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!existingGanttChart) {
      throw new NotFoundException('Gantt chart not found');
    }

    const user = await this.getUserOrThrow(userId);
    const isOwner = existingGanttChart.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this gantt chart');
    }

    return this.prisma.ganttChart.delete({
      where: { id },
    });
  }

  async getGanttCharts(ideaId: number, userId: number) {
    const access = await this.assertIdeaAccess(ideaId, userId);

    if (!access.isOwner && !access.isAdmin && !access.isCommitteeMember) {
      throw new ForbiddenException('You do not have permission to access this idea gantt chart');
    }

    return {
      message: 'Gantt phases retrieved successfully',
      data: await this.prisma.ganttChart.findMany({
        where: { ideaId },
        include: { tasks: true },
        orderBy: { startDate: 'asc' },
      }),
    };
  }

  async getCommitteeGanttCharts(ideaId: number, userId: number) {
    const access = await this.assertIdeaAccess(ideaId, userId);
    if (!access.isAdmin && !access.isCommitteeMember) {
      throw new ForbiddenException('Only committee members or admins can access this endpoint');
    }

    return {
      message: 'Committee gantt data retrieved successfully',
      data: await this.prisma.ganttChart.findMany({
        where: { ideaId },
        include: { tasks: true },
        orderBy: { startDate: 'asc' },
      }),
    };
  }
}