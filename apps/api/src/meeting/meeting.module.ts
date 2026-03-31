import { Module } from '@nestjs/common';
import { MettingService } from './meeting.service';
import { MettingController } from './meeting.controller';

@Module({
  controllers: [MettingController],
  providers: [MettingService],
})
export class MettingModule {}
