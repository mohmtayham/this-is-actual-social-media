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
import { LaunchRequestService } from './launch-request.service';
import { CreateLaunchRequestDto } from './dto/create-launch-request.dto';
import { UpdateLaunchRequestDto } from './dto/update-launch-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('launch-request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LaunchRequestController {
  constructor(private readonly launchRequestService: LaunchRequestService) {}

  private getUserId(req: { user?: { userId?: number; id?: number; sub?: number } }): number {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user id was not found in request context');
    }
    return userId;
  }

  @Post('idea/:ideaId')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  create(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
    @Body() dto: CreateLaunchRequestDto,
  ) {
    return this.launchRequestService.create(this.getUserId(req), ideaId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMITTEE_MEMBER)
  findAll() {
    return this.launchRequestService.findAll();
  }

  @Get('mine')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  findMine(@Req() req: { user?: { userId?: number; id?: number; sub?: number } }) {
    return this.launchRequestService.findMine(this.getUserId(req));
  }

  @Get(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN, Role.COMMITTEE_MEMBER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.launchRequestService.findOne(id, this.getUserId(req));
  }

  @Patch(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN, Role.COMMITTEE_MEMBER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
    @Body() dto: UpdateLaunchRequestDto,
  ) {
    return this.launchRequestService.update(id, this.getUserId(req), dto);
  }

  @Delete(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.launchRequestService.remove(id, this.getUserId(req));
  }

}
