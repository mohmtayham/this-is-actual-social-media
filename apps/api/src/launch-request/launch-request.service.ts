import { LaunchRequest } from './entities/launch-request.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLaunchRequestDto } from './dto/create-launch-request.dto';
import { UpdateLaunchRequestDto } from './dto/update-launch-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class LaunchRequestService {
  constructor(private prisma: PrismaService) {}

  async requestLaunch(userId: number, ideaId: number, dto: CreateLaunchRequestDto) {
    // 1. جلب الفكرة مع العلاقات للتحقق من الشروط
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        reports: true,
        ganttCharts: true,
      },
    });

    if (!idea) {
      throw new NotFoundException('المشروع غير موجود.');
    }

    // 2. التحقق من تقييم كافة التقارير
    const unreviewedReport = idea.reports.find((report) => report.evaluationScore === null);
    if (unreviewedReport) {
      throw new Error('لا يمكن طلب الإطلاق لأن هناك تقارير لم يتم تقييمها بعد.');
    }

    // 3. التحقق من نسبة الإنجاز في مخططات جانت
    const incompleteTask = idea.ganttCharts.some((gantt) => gantt.progress < 90);
    if (incompleteTask) {
      throw new Error('يجب أن تصل نسبة الإنجاز في كافة المهام إلى 90% على الأقل.');
    }

    // 4. التحقق من وجود طلب سابق (إصلاح خطأ الاستعلام المذكور في الصورة)
    const existingRequest = await this.prisma.launchRequest.findFirst({
      where: {
        ideaId: ideaId,
        status: {
          in: ['SUBMITTED', 'UNDER_REVIEW'], // استخدام 'in' بدلاً من 'OR' لتجنب أخطاء النوع
        },
      },
    });

    if (existingRequest) {
      throw new Error('هناك طلب إطلاق قيد المراجعة بالفعل لهذا المشروع.');
    }

    // 5. إنشاء الطلب الجديد باستخدام الـ DTO
    return await this.prisma.launchRequest.create({
      data: {
        ideaId: ideaId,
        status: 'SUBMITTED',
        executionSteps: dto.executionSteps,
        marketingStrategy: dto.marketingStrategy,
        riskMitigation: dto.riskMitigation,
        founderCommitment: dto.founderCommitment ?? false,
        version: 1,
        // ملاحظة: إذا كان هناك حقل للمستخدم الذي طلب الإطلاق في السكيما، أضفه هنا.
      },
    });
  }

async evaluateLaunchRequest(launchRequestId: number, dto: UpdateLaunchRequestDto) {
const launchRequest = await this.prisma.launchRequest.findUnique({
  where: { id: launchRequestId },
  include: {
    idea: {
      include: {
        roadmap: true,
        committee: {
          include: {
            members: true,
          },
        },
        owner: true,
        meetings: true,
      },
    },
  },
});

if (!launchRequest) {
  throw new Error('Launch request not found');
}
  // FIX: Use quotes for the string value and fix the closing braces
 const meeting = launchRequest.idea.meetings
  .filter((m) => m.type === 'launch_request')
  .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime())[0];

if (!meeting || new Date(meeting.meetingDate) > new Date()) {
  throw new Error('لا يمكن التقييم قبل الاجتماع');
}


}


}






