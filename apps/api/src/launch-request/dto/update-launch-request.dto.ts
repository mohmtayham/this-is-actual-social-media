import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { LaunchRequestStatus } from '@prisma/client';
import { CreateLaunchRequestDto } from './create-launch-request.dto';

export class UpdateLaunchRequestDto extends PartialType(CreateLaunchRequestDto) {
	@IsOptional()
	@IsEnum(LaunchRequestStatus)
	status?: LaunchRequestStatus;

	@IsOptional()
	@IsString()
	@MaxLength(3000)
	committeeNotes?: string;

	@IsOptional()
	@IsDateString()
	launchDate?: string;
}
