import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GanttChart } from 'src/gantt-charts/entities/gantt-chart.entity';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}
  async createtaskinstidegantt(createTaskDto: CreateTaskDto,userId: number) {
const gantt =await  this.prisma.ganttChart.findUnique({
  where: { id: createTaskDto.ganttId },
  include: {
    idea:{
      include:{
        owner:true
      },
    },
  },
});

    if(!gantt){
      throw new NotFoundException('Gantt not found');
    }

  if(gantt.idea.owner.id !== userId){
  throw new ForbiddenException('You are not the owner of this idea');
}
  return this.prisma.task.create({
    data:{
    ...createTaskDto,
    },
  });  
}
  findAll() {
    return `This action returns all tasks`;
  }

 async showAllTasksInSpecificGantt(ganttId: number, userId: number) {

  const gantt = await this.prisma.ganttChart.findUnique({
    where: { id: ganttId },
    include: {
      idea: {     
        include: {
          owner: true,
        },
      },
    },
  });

  if (!gantt) {
    throw new NotFoundException('Gantt not found');
  }

  if (gantt.idea.ownerId !== userId) {
    throw new ForbiddenException('You are not the owner of this idea');
  }

  const tasks = await this.prisma.task.findMany({
    where: {
      ganttId: ganttId,
    },
  });

  return {
    message: 'Tasks retrieved successfully',
    data: tasks,
  };
}


  async updateGanttProgress(ganttId: number) {
  // 1. جلب بيانات الـ Gantt مع المهام المرتبطة به
  const gantt = await this.prisma.ganttChart.findUnique({
    where: { id: ganttId },
    include: { tasks: true },
  });

  if (!gantt) {
    throw new NotFoundException('Gantt chart not found');
  }

   // 2. إذا لم يكن هناك مهام، نعتبر أن نسبة الإنجاز 0%
  if (gantt.tasks.length === 0) {
    return await this.prisma.ganttChart.update({
      where: { id: ganttId },
      data: {
        progress: 0,
        approvalStatus: 'pending',
      },
    });
  }

  // 3. حساب المدة الزمنية للـ Gantt (الوزن)
  // تحويل التاريخ من Prisma (Date object) إلى أيام
  const start = new Date(gantt.startDate);
  const end = new Date(gantt.endDate);
  
  // حساب الفرق بالملي ثانية ثم تحويله لأيام
  const diffTime = Math.abs(end.getTime() - start.getTime());
  let duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  if (duration <= 0) duration = 1;

  // 4. حساب نسبة الإنجاز بناءً على المهام المكتملة
  // في الـ Schema الخاص بك، المهمة إما مكتملة (100%) أو لا (0%)
  const completedTasks = gantt.tasks.filter(t => t.isCompleted).length;
  const totalTasks = gantt.tasks.length;
  
  // نسبة الإنجاز = (عدد المهام المكتملة / إجمالي المهام) * 100
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  // 5. تحديث حقل الـ progress في قاعدة البيانات
  return await this.prisma.ganttChart.update({
    where: { id: ganttId },
    data: {
      progress: completionPercentage, // تحديث حقل progress الموجود في الـ Schema
      approvalStatus: completionPercentage >= 100 ? 'completed' : 'in_progress',
    },
  });
}
}
  