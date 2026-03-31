import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletsService {
constructor(private prisma: PrismaService) {}
 async getWallet(userId: number) {
    return this.prisma.wallet.findUnique({
      where: {
        userId: userId,
      },
    });
  }

async ideaOwnerTransaction(userId: number) {
  // ✅ 1. Get user
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // ✅ 2. Role check (LIKE LARAVEL)
 
  const wallet = user.wallet;

  if (!wallet) {
    throw new Error('Wallet not found for this user');
  }

  // ✅ 3. SAME WHERE LOGIC AS LARAVEL 🔥
  const transactions = await this.prisma.walletTransaction.findMany({
    where: {
      OR: [
        { walletId: wallet.id },
        { senderId: wallet.id },
        { receiverId: wallet.id },
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

  // ✅ 4. SAME MAP AS LARAVEL 🔥
  const data = transactions.map((tx) => ({
    transaction_id: tx.id,
    type: tx.transactionType,
    amount: tx.amount,
    status: tx.status,
    date: tx.createdAt,

    // 🔥 IMPORTANT LOGIC
    direction:
      tx.senderId === wallet.id ? 'outgoing' : 'incoming',

    from: tx.sender?.name ?? '—',
    to: tx.receiver?.name ?? '—',

    payment_method: tx.paymentMethod,
    notes: tx.notes,
  }));

  // ✅ 5. SAME RESPONSE STRUCTURE
  return {
    wallet_id: wallet.id,
    owner_name: user.name,
    balance: wallet.balance,
    transactions: data,
  };
}

  }
