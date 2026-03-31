import { CreateTaskDto } from './../tasks/dto/create-task.dto';
import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { EvaluateIdeaDto } from './dto/EvaluateIdea.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { IdeaStatus } from '@prisma/client'; // <-- Add this
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { map } from 'rxjs';
import { create } from 'domain';

@Injectable()
export class ReportsService {
constructor(private prisma: PrismaService) {}
async ownerIdeaReports(userId: number, ideaId: number) {
  // 1. Check user role
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (user?.role !== Role.IDEA_OWNER) {
    throw new ForbiddenException('غير مصرح لك.');
  }

  // 2. Find the specific idea AND verify ownership (Like Idea::where('owner_id', $user->id)->where('id', $idea_id))
  const idea = await this.prisma.idea.findFirst({
    where: {
      id: ideaId,
      ownerId: userId,
    },
  });

  if (!idea) {
    throw new NotFoundException('لم يتم العثور على هذه الفكرة أو أنها لا تتبع لك.');
  }

  // 3. Get reports for this specific idea (Including the 'meeting' relation like Laravel)
  const reports = await this.prisma.report.findMany({
    where: { ideaId: ideaId },
    include: {
      // If you have a meeting relation in your schema, include it here
      // meeting: { select: { id: true, meetingDate: true, notes: true } } 
    },
    orderBy: { createdAt: 'desc' },
  });

  // 4. Transform the data (This happens AFTER findMany)
  const mappedReports = reports.map((report) => ({
    report_id: report.id,
    report_type: report.reportType,
  description: report.description, // Prisma uses 'content' based on your schema
    // Add other fields from your schema here
    created_at: report.createdAt, 
  }));

  // 5. Return the final structure to match your Laravel JSON
  return {
    idea: {
      id: idea.id,
      title: idea.title,
      status: idea.status,
    },
    total_reports: mappedReports.length,
    reports: mappedReports,
  };
}
async evaluateByCommitteeToidea(
  ideaId: number,
  userId: number,
  dto: EvaluateIdeaDto
) {
  // 1. Authorization
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { committeeMembers: true },
  });

  const idea = await this.prisma.idea.findUnique({
    where: { id: ideaId },
    include: { owner: true, roadmap: true },
  });

  if (!idea) throw new NotFoundException('Idea not found');

  const userCommitteeId = user?.committeeMembers[0]?.committeeId;
  if (!userCommitteeId || idea.committeeId !== userCommitteeId) {
    throw new ForbiddenException('ليس لديك صلاحية تقييم هذه الفكرة.');
  }

  // 2. Ensure initial meeting exists
  const meeting = await this.prisma.meeting.findFirst({
    where: {
      ideaId: idea.id,
      type: 'initial',
      meetingDate: { lte: new Date() },
    },
  });

  if (!meeting) {
    throw new UnprocessableEntityException(
      'لا يمكن تقييم الفكرة قبل انعقاد الاجتماع الأولي من قبل اللجنة.'
    );
  }

  // 3. Roadmap stages (same as Laravel)
  const roadmapStages = [
    { name: 'Idea Submission', actor: 'Idea Owner' },
    { name: 'Initial Evaluation', actor: 'Committee' },
    { name: 'Systematic Planning / Business Plan Preparation', actor: 'Idea Owner' },
    { name: 'Advanced Evaluation Before Funding', actor: 'Committee' },
    { name: 'Funding', actor: 'Idea Owner + Committee / Investor' },
    { name: 'Execution and Development', actor: 'Idea Owner + Committee' },
    { name: 'Launch', actor: 'Idea Owner + Committee' },
    { name: 'Post-Launch Follow-up', actor: 'Idea Owner + Committee' },
    { name: 'Project Stabilization / Platform Separation', actor: 'Idea Owner + Committee' },
  ];

  const currentStageName = 'Initial Evaluation';
  const currentStageIndex = roadmapStages.findIndex(
    (s) => s.name === currentStageName
  );

  const progressPercentage =
    ((currentStageIndex + 1) / roadmapStages.length) * 100;

  // 4. Decision logic
  let newStatus: IdeaStatus;
  let nextStageName: string;
  let stageDescription: string;

  if (dto.evaluationScore >= 80) {
    newStatus = 'APPROVED';

    nextStageName = roadmapStages[currentStageIndex + 1]?.name;

    const nextActor = roadmapStages[currentStageIndex + 1]?.actor;

    stageDescription = `Stage executed by: ${
      roadmapStages[currentStageIndex].actor
    } | Next stage: ${nextStageName} (executed by: ${nextActor})`;
  } else if (dto.evaluationScore >= 50) {
    newStatus = 'NEEDS_REVISION';
    nextStageName = 'Rework the idea';
    stageDescription =
      'Please revise your idea according to committee feedback';
  } else {
    newStatus = 'REJECTED';
    nextStageName = 'Submit a new idea';
    stageDescription =
      'Your idea was not feasible / not implementable';
  }

  // 5. Notification message
  let notificationMessage = '';
  if (newStatus === 'APPROVED') {
    notificationMessage = `تم قبول فكرتك '${idea.title}'. يمكنك الانتقال للمرحلة التالية.`;
  } else if (newStatus === 'NEEDS_REVISION') {
    notificationMessage = `فكرتك '${idea.title}' بحاجة لإعادة صياغة.`;
  } else {
    notificationMessage = `فكرتك '${idea.title}' غير قابلة للتنفيذ، يرجى تقديم فكرة جديدة.`;
  }

  // 6. TRANSACTION
  return this.prisma.$transaction(async (tx) => {
    // A. Upsert Report (🔥 same as Laravel)
    const report = await tx.report.upsert({
      where: {
        // ⚠️ You need UNIQUE constraint for this (see note below)
        ideaId_reportType: {
          ideaId: idea.id,
          reportType: 'initial',
        },
      },
      update: {
        description:
          dto.description || 'تقرير التقييم الأولي للفكرة.',
        evaluationScore: dto.evaluationScore,
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        recommendations: dto.recommendations,
        status: 'completed',
        meetingId: meeting.id,
      },
      create: {
        ideaId: idea.id,
        meetingId: meeting.id,
        reportType: 'initial',
        description:
          dto.description || 'تقرير التقييم الأولي للفكرة.',
        evaluationScore: dto.evaluationScore,
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        recommendations: dto.recommendations,
        status: 'completed',
      },
    });

    // B. Update Idea
    const updatedIdea = await tx.idea.update({
      where: { id: idea.id },
      data: {
        status: newStatus,
        initialEvaluationScore: dto.evaluationScore,
        roadmapStage: currentStageName,
      },
    });

    // C. Update Roadmap
    if (idea.roadmap) {
      await tx.roadmap.update({
        where: { id: idea.roadmap.id },
        data: {
          currentStage: currentStageName,
          stageDescription,
          progressPercentage,
          nextStep: nextStageName,
          lastUpdate: new Date(),
        },
      });
    }

    // D. Notification
    if (idea.ownerId) {
      await tx.notification.create({
        data: {
          userId: idea.ownerId,
          title: 'نتيجة التقييم الأولي لفكرتك',
          message: notificationMessage,
          type: 'initial_report_owner',
        },
      });
    }

    return { idea: updatedIdea, report };
  });
}

//show iniitial report results for owner
async ownerIdeaReportsInitial(userId: number, ideaId: number) {
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  include: { committeeMembers: true },
});

const commiteeID= user?.committeeMembers[0]?.committeeId;

const idea= await this.prisma.idea.findFirst({
  where: {
    id: ideaId,
    committeeId: commiteeID,


}
});
if (!idea) {
  throw new NotFoundException('Idea not found or you do not have access to it.');
}

const reportsData = await this.prisma.report.findMany({
  where: { ideaId: ideaId, reportType: 'initial' },
  include: {
    meeting: { select: { id: true, meetingDate: true, notes: true } },
  },
orderBy: { createdAt: 'desc' },

});

const reports = reportsData.map((report) => ({
  report_id: report.id,
  report_type: report.reportType,
  description: report.description,
  evaluationScore: report.evaluationScore,
  strengths: report.strengths,
  weaknesses: report.weaknesses,
  recommendations: report.recommendations,

  meeting: report.meeting ? {
    meeting_date: report.meeting.meetingDate,
    notes: report.meeting.notes,
  } : null, 
  created_at: report.createdAt,
}));
if (reports.length === 0) {
  throw new NotFoundException('No initial evaluation report found for this idea.');
}
return {
  idea: {
    id: idea.id,
    title: idea.title,
    status: idea.status,
  },
  total_reports: reports.length,
  reports: reports,


}
}

async ownerAdavancedReports(userId: number, ideaId: number) { 


  const idea= await this.prisma.idea.findFirst({
  where: {
    id: ideaId,
    ownerId: userId,
  }
});



const reportsData= await this.prisma.report.findMany({
  where: { ideaId: ideaId, reportType: 'advanced' },
  include: {
    meeting: { select: { id: true, meetingDate: true, notes: true } },
  },
orderBy: { createdAt: 'desc' },
});
const reports=reportsData.map((report) => ({
  report_id: report.id,
  report_type: report.reportType,
  description: report.description,
  evaluationScore: report.evaluationScore,
  strengths: report.strengths,
  weaknesses: report.weaknesses,
  recommendations: report.recommendations,
  meeting: report.meeting ? {
    meeting_date: report.meeting.meetingDate,
    notes: report.meeting.notes,
  } : null,
  created_at: report.createdAt,
}));


if(reports.length === 0) {
  throw new NotFoundException('No advanced evaluation report found for this idea.');
}
return {
  idea: {
    id: ideaId,
    title: idea?.title,
  },
  total_reports: reports.length,
  reports: reports,
}
}

  // Similar logic to initial evaluation but with 'advanced' reportType and different status updates
  // but thier logic is  relies in business plan and meeting against first one how relies on
  // initial meeting  and that function update business plan and roadmap and the report now is advanced and he
  // sent notification to owner and committee and investor if exist and the next step is funding if the score is good and if not it will be rejected or need revision and the notification 
async advancedEvaluateByCommitteeToidea(
  ideaId: number,
  userId: number,
  dto: EvaluateIdeaDto
) {

const idea = await this.prisma.idea.findUnique({
  where: { id: ideaId },
  include: { owner: true, roadmap: true ,businessPlans: true},


});

// داخل الـ Service
const latestBusinessPlan = await this.prisma.businessPlan.findFirst({
  where: { ideaId: ideaId },
  orderBy: {
    createdAt: 'desc', // ترتيب تنازلي (الأحدث أولاً)
  },
});
if(!latestBusinessPlan){
  throw new NotFoundException('No business plan found for this idea.');
}


const meeting = await this.prisma.meeting.findFirst({
  where: {
    ideaId: ideaId,
    type: 'business_plan_review',
    

},
orderBy: { meetingDate: 'desc' }, // Get the latest meeting
});
if(!meeting){
return new NotFoundException('No business plan review meeting found for this idea.');

}

if(meeting.meetingDate > new Date()){
  throw new UnprocessableEntityException(
    'لا يمكن تقييم الفكرة قبل انعقاد اجتماع مراجعة خطة العمل.'
  );  
}
latestBusinessPlan.latestScore = dto.evaluationScore;


}






}