import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class CheckCodeDto {
  @IsNotEmpty()
  @Length(10, 100)
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(6)
  @ApiProperty()
  code: string;
}
