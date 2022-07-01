import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 100)
  @IsEmail()
  @ApiProperty({ required: true })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  @ApiProperty({ required: true })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  @Matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')
  @ApiProperty({ required: true })
  password: string;

  @IsString()
  @Length(0, 100)
  @IsOptional()
  @ApiProperty({ required: false })
  address?: string = '';
}
