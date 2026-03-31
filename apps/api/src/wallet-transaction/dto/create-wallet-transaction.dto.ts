import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';

import { TransactionType, TransactionStatus } from '@prisma/client';

export class CreateWalletTransactionDto {
  @IsNumber()
  amount: number;

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsInt()
  walletId: number;

  @IsOptional()
  @IsInt()
  senderId?: number;

  @IsOptional()
  @IsInt()
  receiverId?: number;

  @IsOptional()
  @IsInt()
  fundingId?: number;
}