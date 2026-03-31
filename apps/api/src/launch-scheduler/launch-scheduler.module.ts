// src/launch-scheduler/launch-scheduler.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';  // adjust path if needed
import { LaunchSchedulerService } from './launch-scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [LaunchSchedulerService],
})
export class LaunchSchedulerModule {}