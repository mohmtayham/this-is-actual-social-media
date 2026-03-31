import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Committee } from 'src/committees/entities/committee.entity';
import { stat } from 'fs';
import { response } from 'express';

@Injectable()
export class MettingService {
constructor(private prisma: PrismaService) {}
async getMettingOfIdeaOwner(ideaId: number, userId: number,) {

  const idea = await this.prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new NotFoundException('Idea not found');
  }

  if (idea.ownerId !== userId) {
    throw new ForbiddenException('This idea does not belong to you');
  }

  const meetings = await this.prisma.meeting.findMany({
    where: {
      ideaId: ideaId,
      meetingDate: {
        gte: new Date(), 
      },
    },
    orderBy: {
      meetingDate: 'asc',
    },
  });

  
  const formattedMeetings = meetings.map((meeting) => {
    const now = new Date();
    const hoursLeft =
      (new Date(meeting.meetingDate).getTime() - now.getTime()) /
      (1000 * 60 * 60);

    const isSoon = hoursLeft <= 24;

    return {
      id: meeting.id,
      idea_title: idea.title,
      meeting_date: meeting.meetingDate,
      notes: meeting.notes,
      requested_by: meeting.requestedBy,
      type: meeting.type,
      hours_left: Math.floor(hoursLeft),
      is_soon: isSoon,
    };
  });

  return {
    message: 'تم جلب الاجتماعات القادمة لهذه الفكرة بنجاح.',
    idea_id: idea.id,
    upcoming_meetings: formattedMeetings,
  };
}


async showIdeaOwnerAndThereIdeasAndMeetingForCommitee(userId: number) {

  // 1. Fetch the user and their committee membership
  //that mean user.committeeMember
const user = await this.prisma.user.findUnique({
  where: { id: userId },

 include: { committeeMembers: true }



});
// 2. Guard clause (similar to if (!$user->committeeMember))
  if (!user || !user.committeeMembers) {
    throw new ForbiddenException('أنت لست عضوًا في لجنة.');
  }
//there to many committee so we use [0] to specify the first committee that the user is a member of, and then we access its committeeId property to get the ID of that committee. 
  const CommitteeId=user.committeeMembers[0]?.committeeId;


const idea= await this.prisma.idea.findMany({
  where: { committeeId: CommitteeId,
 },
  
  include: {
    owner: true,
    meetings: true,
  }});
  // return idea.map((idea) => ({
//   const { password, hashedRefreshToken, ...ownerRest } = idea.owner;
// ...idea,
// meeting:idea.meetings.map((meeting) => ({...meeting})),
// idea_owner:idea.owner.name



return idea.map((idea) => {
  const { password, hashedRefreshToken, ...ownerRest } = idea.owner;
  return {
...idea,
meeting:idea.meetings.map((meeting) => ({...meeting})),
idea_owner: {
      ...ownerRest, // This is the 'clean' owner
    },


  };});

  
}



async updateMeetiungLinkandNotesAndMeetingDate(userId: number, meetingId: number, updateMeetingDto: UpdateMeetingDto) {

  const user= await this.prisma.user.findUnique({
    where: { id: userId },
    include: { committeeMembers: true }
  });

  if (!user || !user.committeeMembers) {
    throw new ForbiddenException('أنت لست عضوًا في لجنة.');
  }
  const userCommitteeId = user.committeeMembers[0].committeeId;



  const meeting = await this.prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      idea: true, // Include the related idea to check its committeeId
    },  
  });
  if (!meeting) {
    throw new NotFoundException('Meeting not found');
  }
  ///if the 
  if(meeting.idea?.committeeId !== userCommitteeId){
    throw new ForbiddenException('You are not authorized to update this meeting');
  }
  return this.prisma.meeting.update({
    where: { id: meetingId },
    data: {
      meetingDate: updateMeetingDto.meetingDate,
      notes: updateMeetingDto.notes,
      meetingLink: updateMeetingDto.meetingLink,
    },
  }); 
}




// عمل اجتماع من قبل اللجنة من اجل مناقشة خطة العمل
async scheduleAdvanceMeeting(ideaId: number, userId: number, dto: UpdateMeetingDto) {
  // 1. Get user and their committee
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { committeeMembers: true }
  });

  const userCommitteeId = user?.committeeMembers[0]?.committeeId;

  // 2. Get the Idea with its owner and its existing meetings
  const idea = await this.prisma.idea.findUnique({
    where: { id: ideaId },
    include: { 
      owner: true, 
      meetings: true 
    }
  });

  // 3. Security Guards
  if (!idea) throw new NotFoundException('Idea not found');
  
  if (!userCommitteeId || idea.committeeId !== userCommitteeId) {
    throw new ForbiddenException('ليس لديك صلاحية جدولة الاجتماع لهذه الفكرة.');
  }

  if (!idea.owner) {
    throw new NotFoundException('Idea owner not found');
  }

  // 4. Find if this IDEA already has a 'business_plan_review' meeting
  const existingMeeting = idea.meetings.find(m => m.type === 'business_plan_review');

  if (existingMeeting) {
    // UPDATE the existing meeting
    return this.prisma.meeting.update({
      where: { id: existingMeeting.id },
      data: {
        meetingDate: dto.meetingDate ?? existingMeeting.meetingDate,
        notes: dto.notes ?? existingMeeting.notes,
        meetingLink: dto.meetingLink ?? existingMeeting.meetingLink,
      },
    });
  } else {
    // CREATE a new meeting
    return this.prisma.meeting.create({
      data: {
        ideaId: idea.id,
        meetingDate: dto.meetingDate ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default: +3 days
        // meetingLink: dto.meetingLink ?? null,
        meetingLink: dto.meetingLink ?? 'TBD', // Fixed: provide a default string instead of null
        notes: dto.notes ?? null,
       requestedBy: 'committee', // Fixed: 'requested_by' is a required string in your schema
        type: 'business_plan_review',
      },
    });
  }
}async upcommingComitteeMeeting(userId: number) {
  // 1. Get user and their committee membership (Securely)
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { committeeMembers: true }
  });

  if (!user || user.committeeMembers.length === 0) {
    throw new ForbiddenException('أنت لست عضوًا في لجنة.');
  }

  // Use the ID from the database, not a parameter from the request
  const userCommitteeId = user.committeeMembers[0].committeeId;

  // 2. Fetch meetings
  const meetings = await this.prisma.meeting.findMany({
    where: {  
      idea: {
        committeeId: userCommitteeId, // Filter by the user's committee
      },
      meetingDate: {
        gte: new Date(), // Only future meetings
      },
    },
    include: {
      idea: { select: { title: true } } // Like with(['idea:id,title'])
    },
    orderBy: {
      meetingDate: 'asc',
    },
  }); 
  
  // 3. Map and calculate "Soon" logic (Laravel's diffInHours)
  const now = new Date();

  return meetings.map((meeting) => {
    const diffInMs = meeting.meetingDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(diffInMs / (1000 * 60 * 60));
    const isSoon = hoursLeft <= 24;

    return {
      id: meeting.id,
      idea_title: meeting.idea?.title,
      meeting_date: meeting.meetingDate, // You can use a library like 'date-fns' to format this
      meeting_link: meeting.meetingLink,
      notes: meeting.notes,
      requested_by: meeting.requestedBy,
      type: meeting.type,
      hours_left: hoursLeft,
      is_soon: isSoon,
    };
  });
}
}