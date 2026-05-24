import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateLaunchRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(3000)
  executionSteps: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(3000)
  marketingStrategy: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(3000)
  riskMitigation: string;

  @IsBoolean()
  @IsOptional()
  founderCommitment?: boolean;
}