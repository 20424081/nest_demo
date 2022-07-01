import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { IsEqualTo } from '../decorator/is-equal-to.decorator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  @Matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')
  @ApiProperty()
  old_password: string;

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
