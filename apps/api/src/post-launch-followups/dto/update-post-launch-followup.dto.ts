import { PartialType } from '@nestjs/mapped-types';
import { CreatePostLaunchFollowupDto } from './create-post-launch-followup.dto';

export class UpdatePostLaunchFollowupDto extends PartialType(CreatePostLaunchFollowupDto) {}
