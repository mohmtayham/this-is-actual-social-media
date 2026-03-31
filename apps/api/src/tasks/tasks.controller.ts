import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    return this.tasksService.createtaskinstidegantt(createTaskDto, req.user.id);
  }


  @Get(':ganttId/tasks')showTasks(
  @Param('ganttId') ganttId: number,
  @Req() req
) {
  return this.tasksService.showAllTasksInSpecificGantt(
    Number(ganttId),
    req.user.id,
  );
}
 


 
}
