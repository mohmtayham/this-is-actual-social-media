import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LaunchRequestService } from './launch-request.service';
import { CreateLaunchRequestDto } from './dto/create-launch-request.dto';
import { UpdateLaunchRequestDto } from './dto/update-launch-request.dto';

@Controller('launch-request')
export class LaunchRequestController {
  constructor(private readonly launchRequestService: LaunchRequestService) {}

}
