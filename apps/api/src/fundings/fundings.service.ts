import { BusinessPlan } from './../../../../node_modules/.pnpm/@prisma+client@6.3.1_prisma_2b7e1ed2f9cdc06c70dd68b9cd7715d9/node_modules/.prisma/client/index.d';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFundingDto } from './dto/create-funding.dto';
import { UpdateFundingDto } from './dto/update-funding.dto';

@Injectable()
export class FundingsService {
  constructor(private readonly prisma: PrismaService) {}
async requestFunding(userId: number, ideaId: number) {
  // 1. Get idea + owner + business plans
  const idea = await this.prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      owner: true,
      businessPlans: {
        orderBy: {
          createdAt: 'desc', // 👈 latest plan first
        },
        take: 1, // 👈 get only latest
      },
    },
  });

  // 2. Not found
  if (!idea) {
    throw new NotFoundException('الفكرة غير موجودة.');
  }

  // Gate 1: ownership check
  if (idea.ownerId !== userId) {
    throw new ForbiddenException(
      'ليس لديك صلاحية طلب التمويل لهذه الفكرة.',
    );
  }

  // Extract latest plan
  const businessPlan = idea.businessPlans[0];

  // Gate 2: must have business plan
  if (!businessPlan) {
    throw new BadRequestException(
      'لا يمكن تقديم طلب تمويل قبل إعداد خطة العمل.',
    );
  }

  // Gate 3: score check
  if (!businessPlan.latestScore || businessPlan.latestScore < 80) {
    throw new BadRequestException(
      'خطة العمل لم تحقق الحد الأدنى من التقييم (80) لطلب التمويل.',
    );
  }

const existingFunding = await this.prisma.funding.findFirst({
  where: {  ideaId: ideaId, status: { in: ['requested', 'approved', 'funded', 'rejected'] } },
    
    


});
  if (existingFunding) {
    throw new BadRequestException(
      'يوجد طلب تمويل نشط بالفعل لهذه الفكرة.',
    );
  }





}
async expressInterest(userId: number, ideaId: number) {
const user = await this.prisma.user.findUnique({ where: { id: userId } });
const idea = await this.prisma.idea.findUnique({ where: { id: ideaId } });
if(!user){
  throw new NotFoundException('المستخدم غير موجود.');
}

if (!idea) {
  throw new NotFoundException('الفكرة غير موجودة.');
}
if(user.id === idea.ownerId){
  throw new BadRequestException('لا يمكنك التعبير عن اهتمامك بفكرتك الخاصة.');}




}





  private async getUserOrThrow(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async validateFundingRelations(dto: { ideaId: number; ganttId?: number; taskId?: number }) {
    if (dto.ganttId) {
      const gantt = await this.prisma.ganttChart.findUnique({
        where: { id: dto.ganttId },
      });

      if (!gantt || gantt.ideaId !== dto.ideaId) {
        throw new BadRequestException('Provided gantt chart is invalid for this idea');
      }
    }

    if (dto.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: dto.taskId },
        include: {
          gantt: true,
        },
      });

      if (!task || task.gantt.ideaId !== dto.ideaId) {
        throw new BadRequestException('Provided task is invalid for this idea');
      }
    }
  }
  //////////create

  async create(userId: number, dto: CreateFundingDto) {
    const user = await this.getUserOrThrow(userId);

    const idea = await this.prisma.idea.findUnique({
      where: { id: dto.ideaId },
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

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to create a funding request for this idea');
    }

    await this.validateFundingRelations({
      ideaId: dto.ideaId,
      ganttId: dto.ganttId,
      taskId: dto.taskId,
    });

    return this.prisma.funding.create({
      data: {
        requestedAmount: dto.requestedAmount,
        approvedAmount: dto.approvedAmount,
        justification: dto.justification,
        status: dto.status ?? 'requested',
        committeeNotes: dto.committeeNotes,
        ideaId: dto.ideaId,
        ganttId: dto.ganttId,
        taskId: dto.taskId,
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
        gantt: true,
        task: true,
      },
    });

  }
/////////////////////////////
  async findAll() {
    return this.prisma.funding.findMany({
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            committeeId: true,
          },
        },
        gantt: true,
        task: true,
        transactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMine(userId: number) {
    await this.getUserOrThrow(userId);

    return this.prisma.funding.findMany({
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
        gantt: true,
        task: true,
        transactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number) {
    const user = await this.getUserOrThrow(userId);

    const funding = await this.prisma.funding.findUnique({
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
        gantt: true,
        task: true,
        transactions: true,
      },
    });

    if (!funding) {
      throw new NotFoundException('Funding not found');
    }

    const isOwner = funding.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    const isCommitteeMember =
      funding.idea.committee?.members.some((member) => member.userId === user.id) ?? false;

    if (!isOwner && !isAdmin && !isCommitteeMember) {
      throw new ForbiddenException('You do not have permission to access this funding request');
    }

    return funding;
  }

  async update(id: number, userId: number, dto: UpdateFundingDto) {
    const user = await this.getUserOrThrow(userId);

    const funding = await this.prisma.funding.findUnique({
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

    if (!funding) {
      throw new NotFoundException('Funding not found');
    }

    const isOwner = funding.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    const isCommitteeMember =
      funding.idea.committee?.members.some((member) => member.userId === user.id) ?? false;

    const includesCommitteeFields =
      dto.approvedAmount !== undefined ||
      dto.status !== undefined ||
      dto.committeeNotes !== undefined;

    if (!isOwner && !isAdmin && !isCommitteeMember) {
      throw new ForbiddenException('You do not have permission to update this funding request');
    }

    if (includesCommitteeFields && !isAdmin && !isCommitteeMember) {
      throw new ForbiddenException('Only committee members or admins can set funding approvals');
    }

    if (!includesCommitteeFields && !isOwner && !isAdmin) {
      throw new ForbiddenException('Only idea owners or admins can update funding request details');
    }

    await this.validateFundingRelations({
      ideaId: funding.ideaId,
      ganttId: dto.ganttId,
      taskId: dto.taskId,
    });

    return this.prisma.funding.update({
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
        gantt: true,
        task: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    const user = await this.getUserOrThrow(userId);

    const funding = await this.prisma.funding.findUnique({
      where: { id },
      include: {
        idea: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!funding) {
      throw new NotFoundException('Funding not found');
    }

    const isOwner = funding.idea.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this funding request');
    }

    if (!isAdmin && funding.status !== 'requested') {
      throw new ForbiddenException('Only requested funding entries can be deleted by owners');
    }

    return this.prisma.funding.delete({
      where: { id },
    });
  }
}
