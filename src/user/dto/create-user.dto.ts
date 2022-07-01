import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(10, 100)
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(10, 255)
  @Matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')
  password: string;

  @ApiProperty()
  @IsString()
  @Length(0, 255)
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsString()
  @Length(0, 255)
  @IsOptional()
  facebookId: string;

  @ApiProperty()
  @IsString()
  @Length(0, 500)
  @IsOptional()
  facebookAccessToken: string;

  @ApiProperty()
  @IsString()
  @Length(0, 500)
  @IsOptional()
  facebookRefreshToken: string;

  @ApiProperty()
  @IsString()
  @Length(0, 255)
  @IsOptional()
  avatarURL: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
