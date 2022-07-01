import { PartialType } from '@nestjs/mapped-types';
import { CreateAccessUserDto } from './create-access-user.dto';

export class UpdateAccessUserDto extends PartialType(CreateAccessUserDto) {}
