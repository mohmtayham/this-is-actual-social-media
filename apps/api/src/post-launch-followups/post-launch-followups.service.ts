import { Injectable } from '@nestjs/common';
import { CreatePostLaunchFollowupDto } from './dto/create-post-launch-followup.dto';
import { UpdatePostLaunchFollowupDto } from './dto/update-post-launch-followup.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostLaunchFollowupsService {
 
  constructor(private prisma: PrismaService) {}
async getMyIdeaPostLaunchFollowups(userId: number, ideaId: number) {
  // ✅ 1. Get user
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // // ✅ 2. Role check (مهم جدًا)
  // if (user.role !== 'idea_owner') {
  //   throw new Error('User is not idea owner');
  // }

  // ✅ 3. Get idea + relations
  const idea = await this.prisma.idea.findFirst({
    where: {
      id: ideaId,
      ownerId: userId,
    },
    include: {
      launchRequests: {
        include: {
          postLaunchFollowups: {
            include: {
              reviewer: true,
            },
          },
        },
      },
    },
  });

  if (!idea) {
    throw new Error('Idea not found or you are not the owner');
  }

  // ✅ 4. SAME Laravel flatMap logic 🔥
  // استخدمنا map هنا لنتمكن من تعديل شكل كل followup 
  // وإضافة الـ launch.id الخاص به قبل أن تقوم flatMap بدمجهم
  const followups = idea.launchRequests.flatMap((launch) =>
    launch.postLaunchFollowups.map((followup) => ({
      idea: {
        id: idea.id,
        title: idea.title,
      },
      // 👈 السر هنا! لا يمكننا الوصول لهذا المتغير بدون هذي الطريقة

      launch_request_id: launch.id,

      followup: {
        id: followup.id,
        phase: followup.followup_phase,
        scheduled_date: followup.scheduled_date,
        status: followup.status,

        active_users: followup.active_users,
        revenue: followup.revenue,
        growth_rate: followup.growth_rate,

        performance_status: followup.performance_status,
        risk_level: followup.risk_level,
        risk_description: followup.risk_description,

        committee_decision: followup.committee_decision,

        is_stable: followup.is_stable,
        graduation_date: followup.graduation_date,
        // marketing_support_given: followup.marketing_supportGiven,
        // product_issue_detected: followup.product_issueDetected,
        profit_distributed: followup.profit_distributed,
        owner_acknowledged: followup.owner_acknowledged,
        owner_response: followup.owner_response,

        // ✅ SAFE null check
        reviewed_by: followup.reviewer
          ? {
              id: followup.reviewer.id,
              name: followup.reviewer.name,
            }
          : null,
      },
    }))
  );

  // ✅ 5. نفس Response Laravel
  return {
    message: 'تم جلب متابعات ما بعد الإطلاق للفكرة بنجاح.',
    idea: {
      id: idea.id,
      title: idea.title,
    },
    total_followups: followups.length,
    data: followups,
  };
}

/**
 * 📌 الهدف:
 * عرض جميع متابعات ما بعد الإطلاق لكل الأفكار التي تشرف عليها لجنة المستخدم الحالي.
 *
 * 👤 من يستخدم هذه الدالة؟
 * - أعضاء اللجنة فقط (Committee Members)
 *
 * 🔐 الصلاحيات:
 * - يجب أن يكون المستخدم عضو لجنة
 * - يتم جلب فقط المتابعات المرتبطة بأفكار نفس اللجنة
 *
 * 📊 ماذا ترجع؟
 * - قائمة بكل المتابعات مع:
 *   - بيانات الفكرة وصاحبها
 *   - مؤشرات الأداء (users, revenue, growth)
 *   - قرارات اللجنة
 *   - ملاحظات اللجنة
 *
 * 📅 الترتيب:
 * - يتم ترتيب المتابعات حسب تاريخ المتابعة (scheduled_date)
//  *
//  * ❌ في حال:
//  * - المستخدم ليس عضو لجنة → 403
//  */




/**
 * 📌 الهدف:
 * تمكين صاحب الفكرة من إدخال بيانات الأداء (KPIs) لمتابعة معينة عند موعدها.
 *
 * 👤 من يستخدمها؟
 * - صاحب الفكرة فقط
 *
 * 🧠 ماذا يفعل؟
 * - يسمح بإدخال:
 *   - عدد المستخدمين النشطين
 *   - الإيرادات
 *   - معدل النمو
 *
 * 🔐 الشروط:
 * - المستخدم يجب أن يكون مالك الفكرة
 * - لا يمكن التعديل قبل موعد المتابعة
 * - لا يمكن التعديل إذا المتابعة منتهية (status = done)
 *
 * 🔔 ماذا يحدث بعد التحديث؟
 * - يتم إرسال إشعار لكل أعضاء اللجنة
 *
 * ❌ حالات الرفض:
 * - محاولة التعديل قبل التاريخ → مرفوض
 * - المتابعة منتهية → مرفوض
 * - المستخدم ليس المالك → 403
 */

async committeeSubmitFollowup(userId: number, followupId: number,body: UpdatePostLaunchFollowupDto) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { committeeMembers: true },
  });

  if (!user || !user.committeeMembers?.length) {
    throw new Error('المستخدم ليس عضو لجنة.');
  }

  const followup = await this.prisma.postLaunchFollowup.findUnique({
    where: { id: followupId },
    include: {
      launch_request: {
        include: {
          idea: {
            include: {
              roadmap: true,
              committee: {
                include: {
                  members: true,           // committeeMember[]
                },
              },
            },
          },
        },
      },
    },
  });

  if (!followup) throw new Error('المتابعة غير موجودة');

  const idea = followup.launch_request.idea;

  // التحقق من نفس اللجنة
  if (idea.committeeId !== user.committeeMembers[0].committeeId) {
    throw new Error('ليس لديك صلاحية تعديل هذه المتابعة.');
  }

  // التحقق من وجود اجتماع اليوم
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const meeting = await this.prisma.meeting.findFirst({
    where: {
      ideaId: idea.id,
      type: 'post_launch_followup',
      meetingDate: { gte: todayStart, lte: todayEnd },
    },
  });

  if (!meeting) {
    throw new Error('لا يمكن تقييم المتابعة إلا بعد عقد اجتماع متابعة بعد الإطلاق اليوم.');
  }

  // التأكد أن صاحب الفكرة ملأ البيانات
  if (
    followup.active_users === null ||
    followup.revenue === null ||
    followup.growth_rate === null
  ) {
    throw new Error('صاحب الفكرة لم يملأ الحقل المطلوب بعد.');
  }

  // Validation (يمكنك استخدام class-validator أو manual)
  // هنا نفترض أن الـ DTO يقوم بالـ validation

  // تحديث الـ Followup
  const updatedFollowup = await this.prisma.postLaunchFollowup.update({
    where: { id: followupId },
    data: {
    performance_status: body.performance_status,
        risk_level: body.risk_level,
        risk_description: body.risk_description,
        committee_decision: body.committee_decision,
        actions_taken: body.actions_taken,
        committee_notes: body.committee_notes,
        marketing_support_given: body.marketing_support_given,
        product_issue_detected: body.product_issue_detected,
        is_stable: body.is_stable,
        graduation_date: body.graduation_date,
        reviewed_by: user.id,
        status: 'done',
    },
  });

  // تحديث الـ Report
  const report = await this.prisma.report.findFirst({
    where: {
      ideaId: idea.id,
      reportType: 'post_launch_followup',
      meetingId: meeting.id,
    },
  });

  if (report) {
    await this.prisma.report.update({
      where: { id: report.id },
      data: {
        evaluationScore: body.evaluationScore,
          strengths: body.strengths,
          weaknesses: body.weaknesses,
          recommendations: body.recommendations,
          meetingId: meeting.id,
        status: 'done',
      },
    });
  }
// 1. Define the roadmap stages based on your list
const roadmapStages: { name: string; actor: string }[] = [
  { name: 'Idea Submission', actor: 'Idea Owner' },
  { name: 'Initial Evaluation', actor: 'Committee' },
  { name: 'Systematic Planning / Business Plan Preparation', actor: 'Idea Owner' },
  { name: 'Advanced Evaluation Before Funding', actor: 'Committee' },
  { name: 'Funding', actor: 'Idea Owner (Funding Request) + Committee / Investor' },
  { name: 'Execution and Development', actor: 'Idea Owner (Implementation) + Committee (Stage Evaluation)' },
  { name: 'Launch', actor: 'Idea Owner + Committee' },
  { name: 'Post-Launch Follow-up', actor: 'Idea Owner + Committee' },
  { name: 'Project Stabilization / Platform Separation', actor: 'Idea Owner (Separation Request) + Committee (Approval of Stabilization)' },
];

const currentStageName = 'Project Stabilization / Platform Separation';
const currentStageIndex = roadmapStages.findIndex(s => s.name === currentStageName);
// progressPercentage calculation: (9 / 9) * 100 = 100%
const progressPercentage = ((currentStageIndex + 1) / roadmapStages.length) * 100;

// 2. Graduate Logic: Update or Create Roadmap
if (updatedFollowup.committee_decision === 'graduate' && updatedFollowup.graduation_date) {
  const roadmapData = {
    currentStage: currentStageName,
    stageDescription: `Stage executed by: ${roadmapStages[currentStageIndex].actor}`,
    progressPercentage: Math.round(progressPercentage),
    lastUpdate: new Date(),
    nextStep: 'Project has successfully graduated and stabilized.',
  };

  await this.prisma.roadmap.upsert({
    where: { ideaId: idea.id },
    update: roadmapData,
    create: { ...roadmapData, ideaId: idea.id },
  });

  // Notification for Idea Owner
  await this.prisma.notification.create({
    data: {
      userId: idea.ownerId,
      title: 'مشروعك مستقر وجاهز للانفصال',
      message: 'اللجنة أكملت المتابعة النهائية وقررت أن مشروعك مستقر وجاهز للانفصال عن الحاضنة.',
      type: 'project_graduation',
    },
  });

  // 3. Profit Distribution Logic
  const totalRevenueResult = await this.prisma.postLaunchFollowup.aggregate({
    where: { launch_request: { ideaId: idea.id } },
    _sum: { revenue: true },
  });

  // Fix: Convert Prisma Decimal to Number for comparison
  const totalRevenue = Number(totalRevenueResult._sum.revenue || 0);

  if (totalRevenue > 0) {
    const alreadyDistributed = await this.prisma.profitDistribution.findFirst({
      where: { ideaId: idea.id }
    });

    if (!alreadyDistributed) {
      // Logic for ProfitDistribution goes here (Owner 60%, Committee 20%, etc.)
      
      await this.prisma.postLaunchFollowup.update({
        where: { id: followupId },
        data: { profit_distributed: true },
      });
    }
  }
}

  return {
    message: 'تم تحديث المتابعة والتقرير وخارطة الطريق بنجاح.',
    followup: updatedFollowup,
    report: report ?? null,
    roadmap: idea.roadmap ?? null,
  };
}


async getCommitteePostLaunchFollowups(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { committeeMembers: true },
  });

  if (!user || !user.committeeMembers?.length) {
    throw new Error('المستخدم ليس عضو لجنة.');
  }

  const committeeId = user.committeeMembers[0].committeeId;

  const followups = await this.prisma.postLaunchFollowup.findMany({
    where: {
      launch_request: {
        idea: { committeeId: committeeId }
      }
    },
    include: {
      launch_request: {
        include: {
          idea: { include: { owner: true } }
        }
      },
      reviewer: true
    },
    orderBy: { scheduled_date: 'asc' }
  });

  return {
    message: 'تم جلب متابعات اللجنة بنجاح',
    data: followups
  };
}
}
