import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserOrThrow(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(dto: CreateWalletDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingWallet = await this.prisma.wallet.findUnique({
      where: { userId: dto.userId },
    });

    if (existingWallet) {
      throw new ConflictException('Wallet already exists for this user');
    }

    return this.prisma.wallet.create({
      data: {
        userId: dto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getWallet(userId: number) {
    await this.getUserOrThrow(userId);

    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId },
      });
    }

    const balance = Number(wallet.balance);

    return {
      id: wallet.id,
      balance,
      currency: 'SPY',
      wallet: {
        balance,
        currency: 'SPY',
      },
    };
  }

  async ideaOwnerTransaction(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.wallet) {
      throw new NotFoundException('Wallet not found for this user');
    }

    const transactions = await this.prisma.walletTransaction.findMany({
      where: {
        OR: [
          { walletId: user.wallet.id },
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        funding: {
          select: {
            idea: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      wallet_id: user.wallet.id,
      owner_name: user.name,
      balance: Number(user.wallet.balance),
      transactions: transactions.map((tx) => ({
        transaction_id: tx.id,
        type: tx.transactionType,
        amount: Number(tx.amount),
        status: tx.status,
        date: tx.createdAt,
        direction: tx.senderId === user.id ? 'outgoing' : 'incoming',
        from: tx.sender?.name ?? null,
        to: tx.receiver?.name ?? null,
        payment_method: tx.paymentMethod,
        notes: tx.notes,
        idea: tx.funding?.idea ?? null,
      })),
    };
  }

  async findByUserId(requesterId: number, targetUserId: number) {
    const requester = await this.getUserOrThrow(requesterId);
    if (requester.role !== Role.ADMIN && requester.id !== targetUserId) {
      throw new ForbiddenException('You do not have permission to access this wallet');
    }

    return this.getWallet(targetUserId);
  }

  async remove(id: number, requesterId: number) {
    const requester = await this.getUserOrThrow(requesterId);
    if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete wallets');
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { id } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.prisma.wallet.delete({ where: { id } });
  }

  update(_id: number, _dto: UpdateWalletDto) {
    throw new ForbiddenException('Wallet updates are not allowed directly');
  }
}
