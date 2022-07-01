import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsEqualTo } from '../decorator/is-equal-to.decorator';

export class ChangePasswordForGotDto {
  @IsNotEmpty()
  @Length(10, 100)
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(20, 255)
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  @Matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')
  @ApiProperty()
  new_password: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  @IsEqualTo('new_password')
  @ApiProperty()
  confirm_password: string;
}
