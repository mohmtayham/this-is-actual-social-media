import { map } from 'rxjs';
import { Prisma } from '@prisma/client';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MeetingService {
  constructor(private prisma: PrismaService) {}

  async getUpcomingMeetings(userId: number, ideaId: number) {
  // 1. Fetch idea + meetings
  const idea = await this.prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      meetings: {
        where: {
          meetingDate: {
            gte: new Date(),
          },
        },
        orderBy: {
          meetingDate: 'asc',
        },
      },
    },
  });

  // 2. Not Found
  if (!idea) {
    throw new NotFoundException('المحتوى غير موجود.');
  }

  // 3. Ownership check
  if (idea.ownerId !== userId) {
    throw new ForbiddenException('هذه الفكرة لا تتبع لك.');
  }

  // 4. Map البيانات
  const upcomingMeetings = idea.meetings.map((meeting) => {
    const now = new Date();
    const diffInMs = meeting.meetingDate.getTime() - now.getTime();

    const hoursLeft = Math.max(
      0,
      Math.floor(diffInMs / (1000 * 60 * 60))
    );

    return {
      id: meeting.id,
      idea_title: idea.title,

      meeting_date: meeting.meetingDate,
      meeting_link: meeting.meetingLink,
      notes: meeting.notes,
      requested_by: meeting.requestedBy,
      type: meeting.type,

      hours_left: hoursLeft,
      is_soon: hoursLeft <= 24,
    };
  });

  return {
    message: 'تم جلب الاجتماعات القادمة لهذه الفكرة بنجاح.',
    idea_id: idea.id,
    upcoming_meetings: upcomingMeetings,
  };
}

async committeeIdeasMeetings(userId: number) {
  // 1. Check if user is committee member
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      committeeMembers: true,
    },
  });

  if (!user || user.committeeMembers.length === 0) {
    throw new ForbiddenException('أنت لست عضوًا في لجنة.');
  }

  const committeeId = user.committeeMembers[0].committeeId;
// committeeId: {
//   in: user.committeeMembers.map(cm => cm.committeeId)
// }
  // 2. Get ideas + owner + meetings
  const ideas = await this.prisma.idea.findMany({
    where: {
      committeeId: committeeId,
    },
    include: {
      owner: true,
      meetings: true,
    },
  });

  // 3. Format data
  const formattedCommittee = ideas.map((idea) => {
    return {
      idea_id: idea.id,
      title: idea.title,
      description: idea.description,
      status: idea.status,

      meetings: idea.meetings.map((meeting) => ({
        meeting_id: meeting.id,
        meeting_date: meeting.meetingDate,
        meeting_link: meeting.meetingLink,
        notes: meeting.notes,
        requested_by: meeting.requestedBy,
        type: meeting.type,
      })),

      idea_owner: {
        name: idea.owner?.name,
        email: idea.owner?.email,
        phone: idea.owner?.phone,
        profile_image: idea.owner?.profileImage,
        bio: idea.owner?.bio,
        user_type: idea.owner?.role,
      },
    };
  });

  // 4. Return response
  return {
    message: 'تم جلب جميع الأفكار التي تشرف عليها اللجنة بنجاح.',
    ideas: formattedCommittee,
  };
}


async scheduleAdvancedMeeting(
  userId: number,
  ideaId: number,
  dto: {
    meetingDate?: Date;
    meetingLink?: string;
    notes?: string;
  }
) {
  // 1. Fetch idea + owner + committee
  const idea = await this.prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      owner: true,
    committee: true,
    },
  });

  if (!idea) {
    throw new NotFoundException('الفكرة غير موجودة.');
  }

  // 2. Check committee membership
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      committeeMembers: true,
    },
  });
  // 🔥 التعديل هنا: التأكد أن الفكرة مرتبطة بلجنة
if (!idea.committeeId) {
  throw new ForbiddenException('هذه الفكرة لم يتم تعيينها للجنة بعد.');
}
  const membership = await this.prisma.committeeMember.findFirst({
  where: {
    userId: userId,
    committeeId: idea.committeeId,
  },
});

if (!membership) {
  throw new ForbiddenException('ليس لديك صلاحية');
}

  const isAllowed = user?.committeeMembers.some(
    (cm) => cm.committeeId === idea.committeeId
  );

  if (!isAllowed) {
    throw new ForbiddenException(
      'ليس لديك صلاحية جدولة الاجتماع لهذه الفكرة.'
    );
  }

  // 3. Check idea owner
  if (!idea.owner) {
    throw new NotFoundException('الفكرة لا تملك صاحب.');
  }

  // 4. UPSERT meeting (🔥 أفضل من Laravel)
  const meeting = await this.prisma.meeting.upsert({
    where: {
      ideaId_type: {
        ideaId: idea.id,
        type: 'business_plan_review',
      },
    },
    update: {
      meetingDate: dto.meetingDate ?? undefined,
      meetingLink: dto.meetingLink ?? undefined,
      notes: dto.notes ?? undefined,
    },
    create: {
      ideaId: idea.id,
      meetingDate: dto.meetingDate ?? new Date(Date.now() + 3 * 86400000), // +3 days
      meetingLink: dto.meetingLink ?? "",
      notes: dto.notes ?? null,
      requestedBy: 'committee',
      type: 'business_plan_review',
    },
  });

  return {
    message: 'تم جدولة الاجتماع للتقييم المتقدم بنجاح.',
    meeting,
  };
}
//show the meething of committee 
async upcomingCommitteeMeetings(userId: number) {
  // 1. تأكد أن المستخدم عضو لجنة
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      committeeMembers: true,
    },
  });

  if (!user || user.committeeMembers.length === 0) {
    throw new ForbiddenException('أنت لست عضو لجنة.');
  }

  const committeeId = user.committeeMembers[0].committeeId;

  // 2. جلب الاجتماعات المرتبطة بأفكار نفس اللجنة
  const meetings = await this.prisma.meeting.findMany({
    where: {
      meetingDate: {
        gte: new Date(), // نفس now()
      },
      idea: {
        committeeId: committeeId, // 🔥 equivalent of whereHas
      },
    },
    include: {
      idea: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      meetingDate: 'asc',
    },
  });

  // 3. تنسيق البيانات (map)
  const formattedMeetings = meetings.map((meeting) => {
    const now = new Date();
    const diffMs = meeting.meetingDate.getTime() - now.getTime();

    const hoursLeft = Math.max(
      0,
      Math.floor(diffMs / (1000 * 60 * 60))
    );

    return {
      id: meeting.id,
      idea_title: meeting.idea?.title,
      meeting_date: meeting.meetingDate,
      meeting_link: meeting.meetingLink,
      notes: meeting.notes,
      requested_by: meeting.requestedBy,
      type: meeting.type,

      hours_left: hoursLeft,
      is_soon: hoursLeft <= 24,
    };
  });

  // 4. response
  return {
    message: 'تم جلب الاجتماعات القادمة الخاصة باللجنة بنجاح.',
    upcoming_meetings: formattedMeetings,
  };
}



}
