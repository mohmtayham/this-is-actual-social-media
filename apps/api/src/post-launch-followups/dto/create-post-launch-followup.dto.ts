// create-post-launch-followup.dto.ts
import { IsNumber, IsOptional, IsString, IsEnum, IsBoolean, IsDecimal, IsDateString } from 'class-validator';
import { PerformanceStatus, RiskLevel, CommitteeDecision } from '@prisma/client';

export class CreatePostLaunchFollowupDto {
  @IsOptional() @IsEnum(PerformanceStatus) performance_status?: PerformanceStatus;
  @IsOptional() @IsEnum(RiskLevel) risk_level?: RiskLevel;
  @IsOptional() @IsString() risk_description?: string;
  @IsOptional() @IsEnum(CommitteeDecision) committee_decision?: CommitteeDecision;
  @IsOptional() @IsString() actions_taken?: string;
  @IsOptional() @IsString() committee_notes?: string;
  @IsOptional() @IsBoolean() marketing_support_given?: boolean;
  @IsOptional() @IsBoolean() product_issue_detected?: boolean;
  @IsOptional() @IsBoolean() is_stable?: boolean;
  @IsOptional() @IsDateString() graduation_date?: Date;

  // Report fields
  @IsOptional() @IsNumber() evaluationScore?: number;
  @IsOptional() @IsString() strengths?: string;
  @IsOptional() @IsString() weaknesses?: string;
  @IsOptional() @IsString() recommendations?: string;
}