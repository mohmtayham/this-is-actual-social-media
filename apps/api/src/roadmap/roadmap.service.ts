// src/ideas/ideas.service.ts
import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdeaStatus } from '@prisma/client'; // أضف هذا السطر
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { get } from 'http';

@Injectable()
export class RoadmapService {
  constructor(private prisma: PrismaService) {}
async create(userId: number, createRoadmapDto: CreateRoadmapDto) {
  const { ideaId, currentStage } = createRoadmapDto;

  // 1️⃣ التحقق من وجود الفكرة أولاً
  const idea = await this.prisma.idea.findUnique({
    where: { id: ideaId },
  });
  if (!idea) {
    throw new NotFoundException('Idea not found');
  }

  // 2️⃣ منع إنشاء خارطة طريق مكررة لنفس الفكرة
  const existingRoadmap = await this.prisma.roadmap.findFirst({
    where: { ideaId },
  });
  if (existingRoadmap) {
    throw new ForbiddenException('A roadmap already exists for this idea. Use PATCH to update it.');
  }

  // 3️⃣ جلب مصفوفة المراحل لحساب الخطوة التالية والنسبة المئوية
  const roadmapStages = this.getAllStages();
  const currentStageName = currentStage || roadmapStages[0].name;

  const currentStageIndex = roadmapStages.findIndex(
    (stage) => stage.name === currentStageName,
  );

  // إذا لم يتم العثور على المرحلة المرسلة، نختار المرحلة الأولى كخيار افتراضي
  const actualIndex = currentStageIndex !== -1 ? currentStageIndex : 0;
  const actualStageName = currentStageIndex !== -1 ? currentStageName : roadmapStages[0].name;

  // تحديد المرحلة القادمة
  const nextStage = actualIndex + 1 < roadmapStages.length ? roadmapStages[actualIndex + 1] : null;
  const nextStageName = nextStage ? nextStage.name : null;

  // حساب النسبة المئوية تلقائياً (إلا إذا تم إرسال نسبة مخصصة في الـ DTO)
  const progressPercentage = createRoadmapDto.progressPercentage ?? ((actualIndex + 1) / roadmapStages.length) * 100;

  // صياغة الوصف التلقائي
  const stageDescription = `المرحلة الحالية: ${actualStageName}` + (nextStageName ? ` | المرحلة القادمة: ${nextStageName}` : '');

  // 4️⃣ حفظ الخارطة في قاعدة البيانات بجميع البيانات المحسوبة
  const roadmap = await this.prisma.roadmap.create({
    data: {
      ideaId,
      currentStage: actualStageName,
      progressPercentage,
      stageDescription,
      nextStep: nextStageName,
      lastUpdate: new Date(), // تعيين تاريخ التحديث الحالي
    },
  });

  // تحديث حقل المرحلة داخل جدول الأفكار أيضاً ليبقى متوافقاً
  await this.prisma.idea.update({
    where: { id: ideaId },
    data: { roadmapStage: actualStageName },
  });

  return roadmap;
}
  findAll() {
    return this.prisma.roadmap.findMany();
  }

  async findByIdea(ideaId: number) {
    let roadmap = await this.prisma.roadmap.findFirst({
      where: { ideaId },
      include: {
        idea: true,
      },
    });

    if (!roadmap) {
      // If no roadmap exists, let's create a default one for this idea so it doesn't crash
      roadmap = await this.prisma.roadmap.create({
        data: {
          ideaId,
          currentStage: 'Idea Submission',
          progressPercentage: 10,
          stageDescription: 'The idea has been submitted and is waiting for initial evaluation.',
          nextStep: 'Initial Evaluation'
        },
        include: { idea: true }
      });
    }

    return roadmap;
  }

  async findOne(id: number) {


  const roadmaps= await this.prisma.roadmap.findUnique({
      where: { id },
      include: {
        idea: true, // Include the related idea details
      },


      
  });
if (!roadmaps) {
      throw new NotFoundException(`Roadmap with ID ${id} not found`);
    }

   
    return {
      id: roadmaps.id,
      ideaId: roadmaps.ideaId,
      currentStage: roadmaps.currentStage,
      progressPercentage: roadmaps.progressPercentage,
     

    };



}


  
  update(id: number, updateRoadmapDto: UpdateRoadmapDto) {
  const {currentStage, progressPercentage} = updateRoadmapDto;
  const exitingRoadmap =this.prisma.roadmap
  .findUnique({
    where: { id },
  });

  
  if (!exitingRoadmap) {
    throw new NotFoundException(`Roadmap with ID ${id} not found`);
  }
const updatedRoadmap = this.prisma.roadmap.update({
  where: { id },
  data: {
    currentStage: updateRoadmapDto.currentStage,
    progressPercentage: updateRoadmapDto.progressPercentage,
  },
});
  return updatedRoadmap;
  }

   getAllStages(){
    return [
      {
        name: 'Idea Submission',
        message_for_owner:
          'أنت بحاجة لتقديم فكرتك مع كافة التفاصيل المطلوبة، انتظر تقييم اللجنة.',
      },
      {
        name: 'Initial Evaluation',
        message_for_owner:
          'اللجنة ستقوم بتقييم فكرتك وإعطاء ملاحظات أولية. أنت لا تحتاج لفعل شيء في هذه المرحلة إلا الملاحظة.',
      },
      {
        name: 'Systematic Planning / Business Plan Preparation',
        message_for_owner:
          'أنت بحاجة لتحضير خطة عمل منهجية وإرسالها للجنة للمراجعة.',
      },
      {
        name: 'Advanced Evaluation Before Funding',
        message_for_owner:
          'اللجنة ستقيم جاهزية مشروعك للتمويل. استجب لأي ملاحظات إذا طلبت.',
      },
      {
        name: 'Funding',
        message_for_owner:
          'أنت بحاجة لتقديم طلب تمويل مع توضيح الاحتياجات، اللجنة أو المستثمر سيوافق أو يطلب تعديلات.',
      },
      {
        name: 'Execution and Development',
        message_for_owner:
          'قم بتنفيذ المشروع ورفع التقارير، اللجنة ستقوم بمراجعة التقدم وتقديم التوصيات.',
      },
      {
        name: 'Launch',
        message_for_owner:
          'حضّر المشروع للإطلاق وراجع جاهزيته، اللجنة ستوافق على الإطلاق وتقدم التوصيات.',
      },
      {
        name: 'Post-Launch Follow-up',
        message_for_owner:
          'اللجنة ستقوم برفع تقارير متابعة، أنت تراقب وتتعامل مع أي ملاحظات أو مشاكل.',
      },
      {
        name: 'Project Stabilization / Platform Separation',
        message_for_owner: 'ادخل تفقد .',
      },
    ];
  }// تحديث مرحلة الـ Roadmap بناءً على الفكرة
async updateRoadmapStage(ideaId: number) {

  // 1️⃣ جلب الفكرة من قاعدة البيانات
  const idea = await this.prisma.idea.findUnique({
    where: { id: ideaId },
    include: { roadmap: true }, // جلب الـ roadmap المرتبط بالفكرة إن وجد
  });

  // إذا لم تكن الفكرة موجودة
  if (!idea) {
    throw new NotFoundException('الفكرة غير موجودة');
  }
        
  // 2️⃣ جلب جميع مراحل الـ roadmap المعرفة في النظام
  const roadmapStages = this.getAllStages();

  // المرحلة الحالية للفكرة
  const currentStageName = idea.roadmap?.currentStage || roadmapStages[0].name;

  // 3️⃣ إيجاد رقم المرحلة الحالية داخل المصفوفة
  const currentStageIndex = roadmapStages.findIndex(
    stage => stage.name === currentStageName,
  );

  // 4️⃣ تحديد المرحلة القادمة (إن وجدت)
  const nextStage =
    currentStageIndex + 1 < roadmapStages.length
      ? roadmapStages[currentStageIndex + 1]
      : null;

  // اسم المرحلة القادمة
  const nextStageName = nextStage ? nextStage.name : null;

  // 5️⃣ حساب نسبة التقدم
  const progressPercentage =
    ((currentStageIndex + 1) / roadmapStages.length) * 100;

  // 6️⃣ وصف المرحلة الحالية
  const stageDescription = `المرحلة الحالية: ${currentStageName}` +
    (nextStageName ? ` | المرحلة القادمة: ${nextStageName}` : '');

  // 7️⃣ تحديث حقل المرحلة داخل جدول الأفكار
  await this.prisma.idea.update({
    where: { id: ideaId },
    data: {
      roadmapStage: currentStageName,
    },
  });

  // 8️⃣ إذا كان هناك roadmap موجود نقوم بتحديثه
  if (idea.roadmap) {

    await this.prisma.roadmap.update({
      where: { id: idea.roadmap.id },
      data: {
        currentStage: currentStageName,
        progressPercentage: progressPercentage,
        nextStep: nextStageName,
        stageDescription: stageDescription,
        lastUpdate: new Date(),
      },
    });

  } else {

    // 9️⃣ إذا لم يوجد roadmap نقوم بإنشائه
    await this.prisma.roadmap.create({
      data: {
        ideaId: ideaId,
        currentStage: currentStageName,
        progressPercentage: progressPercentage,
        nextStep: nextStageName,
        stageDescription: stageDescription,
        lastUpdate: new Date(),
      },
    });

  }

  // 10️⃣ إرجاع roadmap بعد التحديث
  return this.prisma.roadmap.findFirst({
    where: { ideaId },
  });

  }
  

  async remove(id: number) {
    const existingRoadmap = await this.prisma.roadmap.findUnique({
      where: { id },
    });
    if (!existingRoadmap) {
      throw new NotFoundException(`Roadmap with ID ${id} not found`);
    }
    return this.prisma.roadmap.delete({
      where: { id },
    });
  }

  
}
