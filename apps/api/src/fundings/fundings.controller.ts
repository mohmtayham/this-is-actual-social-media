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
import { FundingsService } from './fundings.service';
import { CreateFundingDto } from './dto/create-funding.dto';
import { UpdateFundingDto } from './dto/update-funding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('fundings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FundingsController {
  constructor(private readonly fundingsService: FundingsService) {}

  private getUserId(req: { user?: { userId?: number; id?: number; sub?: number } }): number {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user id was not found in request context');
    }
    return userId;
  }

  @Post()
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  create(
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
    @Body() createFundingDto: CreateFundingDto,
  ) {
    return this.fundingsService.create(this.getUserId(req), createFundingDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMMITTEE_MEMBER)
  findAll() {
    return this.fundingsService.findAll();
  }

  @Get('mine')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  findMine(@Req() req: { user?: { userId?: number; id?: number; sub?: number } }) {
    return this.fundingsService.findMine(this.getUserId(req));
  }

  @Get(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN, Role.COMMITTEE_MEMBER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.fundingsService.findOne(id, this.getUserId(req));
  }

  @Patch(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN, Role.COMMITTEE_MEMBER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
    @Body() updateFundingDto: UpdateFundingDto,
  ) {
    return this.fundingsService.update(id, this.getUserId(req), updateFundingDto);
  }

  @Delete(':id')
  @Roles(Role.IDEA_OWNER, Role.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.fundingsService.remove(id, this.getUserId(req));
  }
}
