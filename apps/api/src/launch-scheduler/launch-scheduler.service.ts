// src/modules/launch/launch-scheduler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import dayjs from 'dayjs';

@Injectable()
export class LaunchSchedulerService {
  private readonly logger = new Logger(LaunchSchedulerService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async createPostLaunchFollowups() {
    this.logger.log('Starting createPostLaunchFollowups job');

    const now = new Date();

    const launchRequests = await this.prisma.launchRequest.findMany({
      where: {
        status: { in: ['APPROVED', 'LAUNCHED'] },
      },
      include: {
        idea: {
          include: {
            owner: true,
            committee: {
              include: {
                members: {
                  include: { user: true },
                },
              },
            },
          },
        },
        postLaunchFollowups: true,
      },
    });

    const requestsWithoutFollowups = launchRequests.filter(
      (req) => req.postLaunchFollowups.length === 0,
    );

    for (const launch of requestsWithoutFollowups) {
      await this.prisma.$transaction(async (tx) => {
        const launchStart = launch.launchDate ? new Date(launch.launchDate) : now;

        const followups = {
          week_1: dayjs(launchStart).add(7, 'day').toDate(),
          month_1: dayjs(launchStart).add(30, 'day').toDate(),
          month_3: dayjs(launchStart).add(90, 'day').toDate(),
          month_6: dayjs(launchStart).add(180, 'day').toDate(),
        };

        for (const [phaseName, scheduledDate] of Object.entries(followups)) {
          await tx.postLaunchFollowup.create({
            data: {
              launch_request_id: launch.id,
              followup_phase: phaseName as any,
              scheduled_date: scheduledDate,
              status: 'pending',
            },
          });

          await tx.meeting.create({
            data: {
              ideaId: launch.idea.id,
              meetingDate: scheduledDate,
              meetingLink: '',
              notes: `اجتماع متابعة مرحلة ${phaseName} بعد الإطلاق للفكرة '${launch.idea.title}'`,
              requestedBy: 'committee',
              type: 'post_launch_followup',
            },
          });

          await tx.report.create({
            data: {
              ideaId: launch.idea.id,
              // title: `تقرير متابعة مرحلة ${phaseName} بعد الإطلاق`,
              // content: `تقرير متابعة مرحلة ${phaseName} بعد الإطلاق`,
              reportType: 'post_launch_followup',
            },
          });
        }

        await tx.notification.create({
          data: {
            userId: launch.idea.owner.id,
            title: `تم إنشاء جميع المتابعات بعد الإطلاق لمشروع '${launch.idea.title}'`,
            message: `تم إنشاء جميع مراحل المتابعة بعد الإطلاق (أسبوع 1، شهر 1، شهر 3، شهر 6) مع الاجتماعات والتقارير الخاصة بها. يمكنك مراجعتها الآن في لوحة المشروع.`,
            type: 'post_launch_followups_created',
            isRead: false,
          },
        });

        if (launch.idea.committee) {
          for (const member of launch.idea.committee.members) {
            await tx.notification.create({
              data: {
                userId: member.user.id,
                title: `تم إنشاء جميع المتابعات بعد الإطلاق لمشروع '${launch.idea.title}'`,
                message: `تم إنشاء جميع مراحل المتابعة والاجتماعات والتقارير بعد الإطلاق. يمكنك مراجعتها الآن في لوحة إدارة المشاريع.`,
                type: 'post_launch_followups_created',
                isRead: false,
              },
            });
          }
        }

        this.logger.log(`Created follow-ups for LaunchRequest #${launch.id}`);
      }).catch((error) => {
        this.logger.error(`Error for LaunchRequest #${launch.id}: ${error.message}`);
      });
    }

    this.logger.log('Finished createPostLaunchFollowups job');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async notifyUpcomingMeetings() {
    this.logger.log('Starting notifyUpcomingMeetings job');

    const now = new Date();

    const reminders = [
      { minutes: 1440, label: 'قبل 24 ساعة' },
      { minutes: 60, label: 'قبل ساعة' },
      { minutes: 30, label: 'قبل نصف ساعة' },
      { minutes: 1, label: 'قبل دقيقة' },
    ];

    for (const { minutes, label } of reminders) {
      const endTime = dayjs(now).add(minutes, 'minute').toDate();

      const meetings = await this.prisma.meeting.findMany({
        where: {
          meetingDate: {
            gt: now,
            lte: endTime,
          },
        },
        include: {
          idea: {
            include: {
              owner: true,
              committee: {
                include: {
                  members: { include: { user: true } },
                },
              },
            },
          },
        },
      });

      for (const meeting of meetings) {
        if (!meeting.idea || !meeting.idea.owner) {
          this.logger.warn(`Meeting ${meeting.id} has no idea or owner`);
          continue;
        }

        const ownerId = meeting.idea.owner.id;
        const typeOwner = `meeting_reminder_owner_${meeting.id}_${minutes}`;

        const existingOwnerReminder = await this.prisma.notification.findFirst({
          where: { userId: ownerId, type: typeOwner },
        });

        if (!existingOwnerReminder) {
          await this.prisma.notification.create({
            data: {
              userId: ownerId,
              title: `تذكير اجتماع ${label}`,
              message: `سبب الاجتماع: ${meeting.notes || '—'}\nموعد الاجتماع: ${dayjs(meeting.meetingDate).format('YYYY-MM-DD HH:mm')}`,
              type: typeOwner,
              isRead: false,
            },
          });
          this.logger.log(`Sent owner reminder to user ${ownerId} for meeting ${meeting.id}`);
        }

        if (meeting.idea.committee) {
          for (const member of meeting.idea.committee.members) {
            const committeeUserId = member.user.id;
            const typeCommittee = `meeting_reminder_committee_${meeting.id}_${minutes}`;

            const existingCommitteeReminder = await this.prisma.notification.findFirst({
              where: { userId: committeeUserId, type: typeCommittee },
            });

            if (!existingCommitteeReminder) {
              await this.prisma.notification.create({
                data: {
                  userId: committeeUserId,
                  title: `تذكير اجتماع فكرة '${meeting.idea.title}'`,
                  message: `سبب الاجتماع: ${meeting.notes || '—'}\nموعد الاجتماع: ${dayjs(meeting.meetingDate).format('YYYY-MM-DD HH:mm')}`,
                  type: typeCommittee,
                  isRead: false,
                },
              });
              this.logger.log(`Sent committee reminder to user ${committeeUserId} for meeting ${meeting.id}`);
            }
          }
        }
      }
    }

    this.logger.log('Finished notifyUpcomingMeetings job');
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processApprovedLaunches() {
    this.logger.log('Starting processApprovedLaunches job');

    const now = new Date();

    const launchRequests = await this.prisma.launchRequest.findMany({
      where: {
        status: 'APPROVED',
        launchDate: { lte: now },
      },
      include: {
        idea: {
          include: {
            owner: true,
            committee: {
              include: {
                members: { include: { user: true } },
              },
            },
            roadmap: true,
          },
        },
      },
    });

    const roadmapStages = [
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

    for (const launch of launchRequests) {
      const idea = launch.idea;
      const currentStageName = 'Post-Launch Follow-up';
      const currentStageIndex = roadmapStages.findIndex((s) => s.name === currentStageName);
      const nextStage = currentStageIndex + 1 < roadmapStages.length ? roadmapStages[currentStageIndex + 1] : null;
      const progressPercentage = Math.round(((currentStageIndex + 1) / roadmapStages.length) * 100);

      await this.prisma.launchRequest.update({
        where: { id: launch.id },
        data: { status: 'LAUNCHED' },
      });

      await this.prisma.idea.update({
        where: { id: idea.id },
        data: { roadmapStage: currentStageName },
      });

      const stageDescription = `Stage executed by: ${roadmapStages[currentStageIndex].actor}${
        nextStage ? ` | Next stage: ${nextStage.name} (executed by: ${nextStage.actor})` : ' | Project in post-launch follow-up.'
      }`;

      if (idea.roadmap) {
        await this.prisma.roadmap.update({
          where: { id: idea.roadmap.id },
          data: {
            currentStage: currentStageName,
            stageDescription: stageDescription,
            progressPercentage: progressPercentage,
            lastUpdate: new Date(),
            nextStep: nextStage ? `Proceed to ${nextStage.name}` : 'Monitor project stabilization',
          },
        });
      } else {
        await this.prisma.roadmap.create({
          data: {
            ideaId: idea.id,
            currentStage: currentStageName,
            stageDescription: stageDescription,
            progressPercentage: progressPercentage,
            lastUpdate: new Date(),
            nextStep: nextStage ? `Proceed to ${nextStage.name}` : 'Monitor project stabilization',
          },
        });
      }

      await this.prisma.notification.create({
        data: {
          userId: idea.owner.id,
          title: `Your project '${idea.title}' has been launched`,
          message: `The project was automatically launched on ${dayjs(launch.launchDate).format('YYYY-MM-DD HH:mm')}, entering the post-launch follow-up stage.`,
          type: 'launch_launched',
          isRead: false,
        },
      });

      if (idea.committee) {
        for (const member of idea.committee.members) {
          await this.prisma.notification.create({
            data: {
              userId: member.user.id,
              title: `Project '${idea.title}' launched`,
              message: 'The project has been automatically launched according to the scheduled date and is now in the post-launch follow-up stage.',
              type: 'launch_launched',
              isRead: false,
            },
          });
        }
      }

      this.logger.log(`LaunchRequest #${launch.id} processed successfully.`);
    }

    this.logger.log('Finished processApprovedLaunches job');
  }
}