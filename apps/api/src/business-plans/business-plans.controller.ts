import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { BusinessPlansService } from './business-plans.service';
import { CreateBusinessPlanDto } from './dto/create-business-plan.dto';
import { UpdateBusinessPlanDto } from './dto/update-business-plan.dto';

@Controller('business-plans')
export class BusinessPlansController {
  // constructor(private readonly businessPlansService: BusinessPlansService) {}


}
