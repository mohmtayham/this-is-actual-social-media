import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  private getUserId(req: { user?: { userId?: number; id?: number; sub?: number } }): number {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user id was not found in request context');
    }
    return userId;
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateWalletDto) {
    return this.walletsService.create(dto);
  }

  @Get('me')
  @Roles(Role.IDEA_OWNER, Role.COMMITTEE_MEMBER, Role.ADMIN)
  getMyWallet(@Req() req: { user?: { userId?: number; id?: number; sub?: number } }) {
    return this.walletsService.getWallet(this.getUserId(req));
  }

  @Get('me/transactions')
  @Roles(Role.IDEA_OWNER, Role.COMMITTEE_MEMBER, Role.ADMIN)
  getMyTransactions(@Req() req: { user?: { userId?: number; id?: number; sub?: number } }) {
    return this.walletsService.ideaOwnerTransaction(this.getUserId(req));
  }

  @Get(':userId')
  @Roles(Role.IDEA_OWNER, Role.COMMITTEE_MEMBER, Role.ADMIN)
  findByUserId(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.walletsService.findByUserId(this.getUserId(req), targetUserId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user?: { userId?: number; id?: number; sub?: number } },
  ) {
    return this.walletsService.remove(id, this.getUserId(req));
  }

}
