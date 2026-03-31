// src/ideas/dto/create-idea.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description: string;

  @IsString()
  @IsNotEmpty()
  problem: string;

  @IsString()
  @IsNotEmpty()
  solution: string;

  @IsString()
  @IsNotEmpty()
  target_audience: string;

  @IsString()
  @IsOptional()
  additional_notes?: string;

  
  @IsBoolean()
  @IsNotEmpty()
  terms_accepted: boolean;
}