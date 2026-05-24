import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { EvaluateIdeaDto } from './dto/EvaluateIdea.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private getUserId(req: { user?: { userId?: number; id?: number; sub?: number } }): number {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user id was not found in request context');
    }
    return userId;
  }

  @Get('owner/idea/:ideaId')
  @Roles(Role.IDEA_OWNER)
  getOwnerIdeaReports(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: any,
  ) {
    return this.reportsService.ownerIdeaReports(this.getUserId(req), ideaId);
  }

  @Post('evaluate/initial/:ideaId')
  @Roles(Role.COMMITTEE_MEMBER, Role.ADMIN)
  evaluateInitial(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: any,
    @Body() dto: EvaluateIdeaDto,
  ) {
    return this.reportsService.evaluateByCommitteeToidea(ideaId, this.getUserId(req), dto);
  }

  @Get('committee/initial/:ideaId')
  @Roles(Role.COMMITTEE_MEMBER, Role.ADMIN)
  getCommitteeInitialReports(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: any,
  ) {
    return this.reportsService.ownerIdeaReportsInitial(this.getUserId(req), ideaId);
  }

  @Get('owner/advanced/:ideaId')
  @Roles(Role.IDEA_OWNER)
  getOwnerAdvancedReports(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: any,
  ) {
    return this.reportsService.ownerAdavancedReports(this.getUserId(req), ideaId);
  }

  @Post('evaluate/advanced/:ideaId')
  @Roles(Role.COMMITTEE_MEMBER, Role.ADMIN)
  evaluateAdvanced(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: any,
    @Body() dto: EvaluateIdeaDto,
  ) {
    return this.reportsService.advancedEvaluateByCommitteeToidea(ideaId, this.getUserId(req), dto);
  }
}