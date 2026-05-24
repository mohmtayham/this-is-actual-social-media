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
import { BusinessPlansService } from './business-plans.service';
import { CreateBusinessPlanDto } from './dto/create-business-plan.dto';
import { UpdateBusinessPlanDto } from './dto/update-business-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('business-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessPlansController {
  constructor(private readonly businessPlansService: BusinessPlansService) {}

  private getUserId(req: { user?: { userId?: number; id?: number; sub?: number } }): number {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user id was not found in request context');
    }
    return userId;
  }

  @Post()
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  create(@Req() req: { user?: { userId?: number; id?: number; sub?: number } }, @Body() dto: CreateBusinessPlanDto) {
    return this.businessPlansService.create(this.getUserId(req), dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMITTEE_MEMBER)
  findAll() {
    return this.businessPlansService.findAll();
  }

  @Get('mine')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  findMine(@Req() req: { user?: { userId?: number; id?: number; sub?: number } }) {
    return this.businessPlansService.findMine(this.getUserId(req));
  }

  @Get('idea/:ideaId')
  @Roles(Role.IDEA_OWNER, Role.ADMIN, Role.COMMITTEE_MEMBER)
  findByIdea(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.businessPlansService.findByIdea(ideaId, this.getUserId(req));
  }

  @Get(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN, Role.COMMITTEE_MEMBER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.businessPlansService.findOne(id, this.getUserId(req));
  }

  @Patch(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
    @Body() dto: UpdateBusinessPlanDto,
  ) {
    return this.businessPlansService.update(id, this.getUserId(req), dto);
  }

  @Delete(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.businessPlansService.remove(id, this.getUserId(req));
  }


}
