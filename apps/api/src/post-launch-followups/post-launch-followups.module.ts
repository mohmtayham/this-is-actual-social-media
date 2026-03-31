import { Module } from '@nestjs/common';
import { PostLaunchFollowupsService } from './post-launch-followups.service';
import { PostLaunchFollowupsController } from './post-launch-followups.controller';

@Module({
  controllers: [PostLaunchFollowupsController],
  providers: [PostLaunchFollowupsService],
})
export class PostLaunchFollowupsModule {}
