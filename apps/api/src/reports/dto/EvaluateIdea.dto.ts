// evaluate-idea.dto.ts
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class EvaluateIdeaDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  evaluationScore: number;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() strengths?: string;
  @IsOptional() @IsString() weaknesses?: string;
  @IsOptional() @IsString() recommendations?: string;
  @IsString() @IsOptional() latestScore?: string;
}