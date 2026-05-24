import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGanttChartDto {
  @IsInt()
  @IsPositive()
  ideaId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  phaseName: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  failureCount?: number;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'in_progress', 'completed'])
  approvalStatus?: string;
}