import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { PostLaunchFollowupsService } from './post-launch-followups.service';
import { CreatePostLaunchFollowupDto } from './dto/create-post-launch-followup.dto';
import { UpdatePostLaunchFollowupDto } from './dto/update-post-launch-followup.dto';

@Controller('post-launch-followups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostLaunchFollowupsController {
  constructor(private readonly postLaunchFollowupsService: PostLaunchFollowupsService) {}

  private getUserId(req: { user?: { userId?: number; id?: number; sub?: number } }): number {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user id was not found in request context');
    }
    return userId;
  }

  @Post()
  @Roles(Role.ADMIN, Role.COMMITTEE_MEMBER)
  create(@Body() dto: CreatePostLaunchFollowupDto) {
    return this.postLaunchFollowupsService.create(dto);
  }

  @Get('mine')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  findMine(@Req() req: { user?: { userId?: number; id?: number; sub?: number } }) {
    return this.postLaunchFollowupsService.findMine(this.getUserId(req));
  }

  @Get('committee')
  @Roles(Role.COMMITTEE_MEMBER, Role.ADMIN)
  findCommitteeQueue(@Req() req: { user?: { userId?: number; id?: number; sub?: number } }) {
    return this.postLaunchFollowupsService.findCommitteeQueue(this.getUserId(req));
  }

  @Get('launch-request/:launchRequestId')
  @Roles(Role.IDEA_OWNER, Role.COMMITTEE_MEMBER, Role.ADMIN)
  findByLaunchRequest(
    @Param('launchRequestId', ParseIntPipe) launchRequestId: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.postLaunchFollowupsService.findByLaunchRequest(launchRequestId, this.getUserId(req));
  }

  @Get(':id')
  @Roles(Role.IDEA_OWNER, Role.COMMITTEE_MEMBER, Role.ADMIN)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.postLaunchFollowupsService.findOne(id, this.getUserId(req));
  }

  @Patch(':id/owner-metrics')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  submitOwnerMetrics(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
    @Body() dto: UpdatePostLaunchFollowupDto,
  ) {
    return this.postLaunchFollowupsService.submitOwnerMetrics(this.getUserId(req), id, dto);
  }

  @Patch(':id/committee-review')
  @Roles(Role.COMMITTEE_MEMBER, Role.ADMIN)
  submitCommitteeReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
    @Body() dto: UpdatePostLaunchFollowupDto,
  ) {
    return this.postLaunchFollowupsService.submitCommitteeReview(this.getUserId(req), id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.postLaunchFollowupsService.remove(id, this.getUserId(req));
  }
}