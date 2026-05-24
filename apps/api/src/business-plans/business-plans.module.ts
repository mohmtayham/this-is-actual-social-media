import { Module } from '@nestjs/common';
import { BusinessPlansService } from './business-plans.service';
import { BusinessPlansController } from './business-plans.controller';

@Module({
  controllers: [BusinessPlansController],
  providers: [BusinessPlansService],
})
export class BusinessPlansModule {}
