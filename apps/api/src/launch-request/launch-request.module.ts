import { Module } from '@nestjs/common';
import { LaunchRequestService } from './launch-request.service';
import { LaunchRequestController } from './launch-request.controller';

@Module({
  controllers: [LaunchRequestController],
  providers: [LaunchRequestService],
})
export class LaunchRequestModule {}
