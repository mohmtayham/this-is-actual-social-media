import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateFundingDto {
  @IsNumber()
  @IsPositive()
  requestedAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  justification?: string;

  @IsOptional()
  @IsIn(['requested', 'under_review', 'approved', 'rejected', 'released'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  committeeNotes?: string;

  @IsInt()
  @IsPositive()
  ideaId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  ganttId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  taskId?: number;
}


// import { IsNumber, IsString, IsOptional } from 'class-validator';

// export class ApproveFundingDto {
//   @IsNumber()
//   approvedAmount: number;

//   @IsOptional()
//   @IsString()
//   committeeNotes?: string;
// }
// export class CreateFundingRequestDto {
//   @IsNumber()
//   requestedAmount: number;

//   @IsOptional()
//   @IsString()
//   justification?: string;

//   @IsInt()
//   ideaId: number;

//   @IsOptional()
//   @IsInt()
//   ganttId?: number;

//   @IsOptional()
//   @IsInt()
//   taskId?: number;
// }