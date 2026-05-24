import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
// import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';
import { IdeasModule } from './ideas/ideas.module';
import { BusinessPlansModule } from './business-plans/business-plans.module';
import { CommitteesModule } from './committees/committees.module';
import { GanttChartsModule } from './gantt-charts/gantt-charts.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { TasksModule } from './tasks/tasks.module';
import { FundingsModule } from './fundings/fundings.module';
import { WalletsModule } from './wallets/wallets.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProfileModule } from './profile/profile.module';
// import { MeetingsResolver } from './meetings/meetings.resolver';
import { PostLaunchFollowupsModule } from './post-launch-followups/post-launch-followups.module';
import { LaunchSchedulerModule } from './launch-scheduler/launch-scheduler.module';
import { WalletTransactionModule } from './wallet-transaction/wallet-transaction.module';
import { LaunchRequestModule } from './launch-request/launch-request.module';
import { MeetingModule } from './meeting/meeting.module';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
     LaunchSchedulerModule,
    IdeasModule,
    BusinessPlansModule,
    CommitteesModule,
    GanttChartsModule,
    RoadmapModule,
    TasksModule,
    FundingsModule,
    WalletsModule,
    ReportsModule,
    NotificationsModule,
    ProfileModule,
    PostLaunchFollowupsModule,
    WalletTransactionModule,
    LaunchRequestModule,
    MeetingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
  {
  provide: APP_GUARD,
  useFactory: (reflector: Reflector) => new JwtAuthGuard(reflector),
  inject: [Reflector],
}

    // MeetingsResolver,
  ],
})
export class AppModule {}