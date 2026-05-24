import { FollowupPhase, FollowupStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreatePostLaunchFollowupDto {
  @IsInt()
  @IsPositive()
  launchRequestId: number;

  @IsEnum(FollowupPhase)
  followupPhase: FollowupPhase;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsEnum(FollowupStatus)
  status?: FollowupStatus;
}