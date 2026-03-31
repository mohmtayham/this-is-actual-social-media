// import {
//   Injectable,
//   NotFoundException,
//   ForbiddenException,
// } from '@nestjs/common'; 
// import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateBusinessPlanDto } from './dto/create-business-plan.dto';
// import { UpdateBusinessPlanDto } from './dto/update-business-plan.dto';

// @Injectable()
// export class BusinessPlansService {
//   constructor(private prisma: PrismaService) {}

//   async create(createBusinessPlanDto: CreateBusinessPlanDto) {

//     // استخراج ideaId من DTO
//     const { ideaId } = createBusinessPlanDto;

//     // جلب الفكرة مع العلاقات المهمة
//     const idea = await this.prisma.idea.findUnique({
//       where: { id: ideaId },
//       include: {
//         owner: true,
//         roadmap: true,
//         committee: {
//           include: {
//             members: true,
//           },
//         },
//       },
//     });
    
//     // التحقق أن الفكرة موجودة
//     if (!idea) {
//       throw new NotFoundException('Idea not found');
//     }

//     // التحقق من تقييم الفكرة
//     const ideaScore = idea.initialEvaluationScore ?? 0;

//     if (ideaScore < 80) {
//       throw new ForbiddenException(
//         'Idea score is too low to create a business plan',
//       );
//     }

//     // التحقق هل يوجد خطة عمل approved
//     const approvedPlan = await this.prisma.businessPlan.findFirst({
//       where: {
//         ideaId: ideaId,
//         status: 'APPROVED',
//       },
//     });

//     if (approvedPlan) {
//       throw new ForbiddenException(
//         'A business plan for this idea is already approved',
//       );
//     }

//     // إنشاء خطة العمل
//     const businessPlan = await this.prisma.businessPlan.create({
//       data: {
//         ideaId: ideaId,
//         keyPartners: createBusinessPlanDto.keyPartners,
//         keyActivities: createBusinessPlanDto.keyActivities,
//         keyResources: createBusinessPlanDto.keyResources,
//         valueProposition: createBusinessPlanDto.valueProposition,
//         customerRelationships:
//         createBusinessPlanDto.customerRelationships,
//         channels: createBusinessPlanDto.channels,
//         customerSegments: createBusinessPlanDto.customerSegments,
//         costStructure: createBusinessPlanDto.costStructure,
//         revenueStreams: createBusinessPlanDto.revenueStreams,
//         status: 'UNDER_REVIEW',
//      },
//   });
                       
//     // إنشاء اجتماع لمراجعة خطة العمل
//     const meeting = await this.prisma.meeting.create({
//       data: {
//         ideaId: idea.id,
//         meetingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//         type: 'business_plan_review',
//         requestedBy: 'committee',
//         notes:
//           'تم تحديد اجتماع لمراجعة خطة العمل ومناقشة تفاصيل المشروع.',
//       },
//     });

//     // إنشاء تقرير تقييم
//     const report = await this.prisma.report.create({
//       data:{
//         ideaId: idea.id,
//         title: 'Business Plan Evaluation',
//         content: 'سيتم تقييم خطة العمل بعد الاجتماع.',
//         reportType: 'advanced',
//       },
//     });

//     // تحديث الـ roadmap
//     const stages = [
//       'Idea Submission',
//       'Initial Evaluation',
//       'Systematic Planning / Business Plan Preparation',
//       'Advanced Evaluation Before Funding',
//       'Funding',
//       'Execution and Development',
//       'Launch',
//       'Post-Launch Follow-up',
//     ];

//     const currentStage =
//       'Systematic Planning / Business Plan Preparation';

//     const stageIndex = stages.indexOf(currentStage);

//     const progress =
//       ((stageIndex + 1) / stages.length) * 100;

//     const nextStep =
//       stageIndex + 1 < stages.length
//         ? stages[stageIndex + 1]
//         : null;

//     // تحديث أو إنشاء roadmap
//     if (!idea.roadmap) {
//       await this.prisma.roadmap.create({
//         data: {
//           ideaId: idea.id,
//           currentStage: currentStage,
//           progressPercentage: Math.round(progress),
//           stageDescription: 'Business plan preparation stage',
//           nextStep: nextStep,
//           lastUpdate: new Date(),
//         },
//       });
//     } else {
//       await this.prisma.roadmap.update({
//         where: { ideaId: idea.id },
//         data: {
//           currentStage: currentStage,
//           progressPercentage: Math.round(progress),
//           nextStep: nextStep,
//           lastUpdate: new Date(),
//         },
//       });
//     }

//     // تحديث مرحلة الفكرة
//     await this.prisma.idea.update({
//       where: { id: idea.id },
//       data: {
//         roadmapStage: currentStage,
//       },
//     });

//     return {
//       message: 'Business plan created successfully',
//       businessPlan,
//       meeting,
//       report,
//     };
//   }
//   findAll() {
//     return this.prisma.businessPlan.findMany();
//   }
  
//   // }  const idea = await this.prisma.idea.findUnique({
//   //     where: { id: ideaId },
//   //     include: {
//   //       owner: true,
//   //       roadmap: true,
//   //       committee: {
//   //         include: {
//   //           members: true,
//   //         },
//   //       },
//   //     },
//   //   });
// async getAllForCommittee(userId: number) {

//   // التأكد أن المستخدم عضو لجنة
//   const committeeMember = await this.prisma.committeeMember.findFirst({
//     where: { userId },
//   });

//   if (!committeeMember) {
//     throw new ForbiddenException('هذا المستخدم ليس عضو لجنة');
//   }

//   const ideas = await this.prisma.idea.findMany({
//     where: {
//       committeeId: committeeMember.committeeId,
//       businessPlans: {
//         some: {}
//       }
//     },
//     include: {
//       businessPlans: true
//     },
//     orderBy: {
//       createdAt: 'desc'
//     }
//   });

//   return ideas.map((idea) => ({
//     idea_id: idea.id,
//     idea_title: idea.title,
//     idea_description: idea.description,
//     idea_status: idea.status,
//     roadmap_stage: idea.roadmapStage,
//     business_plan: idea.businessPlans[0] ?? null
//   }));
// }

// async updateBMC(
//   ideaId: number,
//   userId: number,
//   dto: UpdateBusinessPlanDto
// ) {

//   const idea = await this.prisma.idea.findUnique({
//     where: { id: ideaId },
//     include: {
//       businessPlans: true,
//       committee: {
//         include: {
//           members: true
//         }
//       },
//       roadmap: true
//     }
//   });

//   if (!idea) {
//     throw new NotFoundException('Idea not found');
//   }

//   // التأكد أن المستخدم صاحب الفكرة
//   if (idea.ownerId !== userId) {
//     throw new ForbiddenException('ليس لديك صلاحية تعديل خطة العمل');
//   }

//   const businessPlan = idea.businessPlans[0];

//   if (!businessPlan) {
//     throw new NotFoundException('لا توجد خطة عمل لهذه الفكرة');
//   }

//   if (
//     businessPlan.status === 'APPROVED'
//   ) {
//     throw new ForbiddenException(
//       'تمت الموافقة على خطة العمل ولا يمكن تعديلها'
//     );
//   }

//   const updatedPlan = await this.prisma.businessPlan.update({
//     where: { id: businessPlan.id },
//     data: {
//       ...dto,
//       status: 'NEEDS_REVISION'
//     }
//   });

//   // تحديث الـ roadmap
//   const stage =
//     'Systematic Planning / Business Plan Preparation';

//   const stages = [
//     'Idea Submission',
//     'Initial Evaluation',
//     'Systematic Planning / Business Plan Preparation',
//     'Advanced Evaluation Before Funding',
//     'Funding',
//     'Execution and Development',
//     'Launch',
//     'Post-Launch Follow-up'
//   ];

//   const index = stages.indexOf(stage);

//   const progress = ((index + 1) / stages.length) * 100;

//   await this.prisma.roadmap.upsert({
//     where: { ideaId },
//     update: {
//       currentStage: stage,
//       progressPercentage: Math.round(progress),
//       stageDescription:
//         'Idea owner updated the business plan',
//       nextStep: 'Awaiting Committee Review',
//       lastUpdate: new Date()
//     },
//     create: {
//       ideaId,
//       currentStage: stage,
//       progressPercentage: Math.round(progress),
//       stageDescription:
//         'Idea owner updated the business plan',
//       nextStep: 'Awaiting Committee Review',
//       lastUpdate: new Date()
//     }
//   });

//   // إرسال إشعارات لأعضاء اللجنة
//   if (idea.committee) {
//     for (const member of idea.committee.members) {
//       await this.prisma.notification.create({
//         data: {
//           userId: member.userId,
//           title: 'تم تعديل خطة العمل',
//           message: `تم تعديل خطة العمل للفكرة '${idea.title}'`,
//           type: 'bmc_updated'
//         }
//       });
//     }
//   }

//   return updatedPlan;
// }
// }