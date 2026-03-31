import {
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';

export class CreateFundingDto {
  @IsNumber()
  requestedAmount: number;

  @IsOptional()
  @IsNumber()
  approvedAmount?: number;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  committeeNotes?: string;

  @IsInt()
  ideaId: number;

  @IsOptional()
  @IsInt()
  ganttId?: number;

  @IsOptional()
  @IsInt()
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