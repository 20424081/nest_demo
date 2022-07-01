import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  search?: string = null;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number = 10;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  offset?: number = 0;
}
