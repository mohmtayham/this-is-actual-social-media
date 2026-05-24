import { PartialType } from '@nestjs/mapped-types';
import {
  CommitteeDecision,
  PerformanceStatus,
  RiskLevel,
} from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CreatePostLaunchFollowupDto } from './create-post-launch-followup.dto';

export class UpdatePostLaunchFollowupDto extends PartialType(CreatePostLaunchFollowupDto) {
  @IsOptional()
  @IsInt()
  @Min(0)
  activeUsers?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  revenue?: number;

  @IsOptional()
  @IsNumber()
  growthRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  ownerResponse?: string;

  @IsOptional()
  @IsBoolean()
  ownerAcknowledged?: boolean;

  @IsOptional()
  @IsEnum(PerformanceStatus)
  performanceStatus?: PerformanceStatus;

  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  riskDescription?: string;

  @IsOptional()
  @IsEnum(CommitteeDecision)
  committeeDecision?: CommitteeDecision;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  actionsTaken?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  committeeNotes?: string;

  @IsOptional()
  @IsBoolean()
  marketingSupportGiven?: boolean;

  @IsOptional()
  @IsBoolean()
  productIssueDetected?: boolean;

  @IsOptional()
  @IsBoolean()
  isStable?: boolean;

  @IsOptional()
  @IsBoolean()
  profitDistributed?: boolean;

  @IsOptional()
  @IsDateString()
  graduationDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  evaluationScore?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  strengths?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  weaknesses?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  recommendations?: string;
}