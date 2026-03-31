import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostLaunchFollowupsService } from './post-launch-followups.service';
import { CreatePostLaunchFollowupDto } from './dto/create-post-launch-followup.dto';
import { UpdatePostLaunchFollowupDto } from './dto/update-post-launch-followup.dto';

@Controller('post-launch-followups')
export class PostLaunchFollowupsController {
  constructor(private readonly postLaunchFollowupsService: PostLaunchFollowupsService) {}


}
