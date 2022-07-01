import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateAccessUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  refreshToken: string;

  @ApiProperty()
  @IsString()
  @Length(1, 22)
  iPAddress: string;

  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsString()
  deviceToken: string;
}
