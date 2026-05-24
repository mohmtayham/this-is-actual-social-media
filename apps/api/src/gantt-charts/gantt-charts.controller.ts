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
import { GanttChartsService } from './gantt-charts.service';
import { CreateGanttChartDto } from './dto/create-gantt-chart.dto';
import { UpdateGanttChartDto } from './dto/update-gantt-chart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('gantt-charts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GanttChartsController {
  constructor(private readonly ganttChartsService: GanttChartsService) {}

  private getUserId(req: { user?: { userId?: number; id?: number; sub?: number } }): number {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user id was not found in request context');
    }
    return userId;
  }

  @Post()
  @Roles(Role.IDEA_OWNER, Role.COMMITTEE_MEMBER, Role.ADMIN)
  create(
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
    @Body() createGanttChartDto: CreateGanttChartDto,
  ) {
    return this.ganttChartsService.create(this.getUserId(req), createGanttChartDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMITTEE_MEMBER)
  findAll() {
    return this.ganttChartsService.findAll();
  }

  @Get('idea/:ideaId')
  @Roles(Role.IDEA_OWNER, Role.COMMITTEE_MEMBER, Role.ADMIN)
  getIdeaGanttCharts(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.ganttChartsService.getGanttCharts(ideaId, this.getUserId(req));
  }

  @Get('committee/:ideaId')
  @Roles(Role.COMMITTEE_MEMBER, Role.ADMIN)
  getCommitteeGanttCharts(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.ganttChartsService.getCommitteeGanttCharts(ideaId, this.getUserId(req));
  }

  @Get(':id')
  @Roles(Role.IDEA_OWNER, Role.COMMITTEE_MEMBER, Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ganttChartsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.IDEA_OWNER, Role.COMMITTEE_MEMBER, Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
    @Body() updateGanttChartDto: UpdateGanttChartDto,
  ) {
    return this.ganttChartsService.update(id, this.getUserId(req), updateGanttChartDto);
  }

  @Delete(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.ganttChartsService.remove(id, this.getUserId(req));
  }
}
