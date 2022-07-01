import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @Length(10, 100)
  @IsEmail()
  @ApiProperty()
  email: string;
}
