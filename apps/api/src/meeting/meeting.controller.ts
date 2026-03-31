import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MettingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Controller('meeting')
export class MettingController {
  constructor(private readonly mettingService: MettingService) {}

 
}
