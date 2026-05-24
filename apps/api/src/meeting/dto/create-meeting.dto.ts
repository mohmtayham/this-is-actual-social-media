import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsUrl, 
  IsISO8601, 
  IsInt, 
  MinLength 
} from 'class-validator';

export class CreateMeetingDto {
  
  @IsNotEmpty({ message: 'تاريخ الاجتماع مطلوب' })
  @IsISO8601({}, { message: 'يجب أن يكون التاريخ بصيغة ISO8601 صحيحة' })
  meetingDate: string;

  @IsNotEmpty({ message: 'رابط الاجتماع مطلوب' })
  @IsUrl({}, { message: 'يجب أن يكون رابط الاجتماع URL صحيح' })
  meetingLink: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'الملاحظات يجب أن تكون أكثر من 3 أحرف' })
  notes?: string;

  @IsNotEmpty({ message: 'نوع الاجتماع مطلوب' })
  @IsString()
  type: string;

  @IsNotEmpty({ message: 'جهة الطلب مطلوبة' })
  @IsString()
  requestedBy: string;

  @IsNotEmpty({ message: 'رقم الفكرة مطلوب' })
  @IsInt({ message: 'يجب أن يكون رقم الفكرة رقماً صحيحاً' })
  ideaId: number;
}