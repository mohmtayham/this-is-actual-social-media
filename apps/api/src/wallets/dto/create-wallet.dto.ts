import { IsInt, IsPositive } from 'class-validator';

export class CreateWalletDto {
  @IsInt()
  @IsPositive()
  userId: number;
}