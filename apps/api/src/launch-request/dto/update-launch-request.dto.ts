import { PartialType } from '@nestjs/mapped-types';
import { CreateLaunchRequestDto } from './create-launch-request.dto';

export class UpdateLaunchRequestDto extends PartialType(CreateLaunchRequestDto) {}
