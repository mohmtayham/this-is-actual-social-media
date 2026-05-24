import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { BusinessPlanStatus } from '@prisma/client';

export class CreateBusinessPlanDto {
  @IsInt()
  @IsPositive()
  ideaId: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  keyPartners?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  keyActivities?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  keyResources?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  valueProposition?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerRelationships?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  channels?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerSegments?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  costStructure?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  revenueStreams?: string;

  @IsOptional()
  @IsEnum(BusinessPlanStatus)
  status?: BusinessPlanStatus;
}