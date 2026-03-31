import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {

  @IsDateString()
  meetingDate: string;

  @IsString()
  type: string;

  @IsString()
  meetingLink: string;

  @IsString()
  requestedBy: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsInt()
  ideaId: number;
}