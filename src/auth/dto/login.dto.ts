import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @Length(10, 100)
  @IsEmail()
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @ApiProperty()
  device_token: string;
}
