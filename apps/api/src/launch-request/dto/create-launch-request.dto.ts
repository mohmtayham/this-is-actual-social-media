import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateLaunchRequestDto {
  @IsString()
  @IsNotEmpty()
  executionSteps: string;

  @IsString()
  @IsNotEmpty()
  marketingStrategy: string;

  @IsString()
  @IsNotEmpty()
  riskMitigation: string;

  @IsBoolean()
  @IsOptional()
  founderCommitment?: boolean;
}