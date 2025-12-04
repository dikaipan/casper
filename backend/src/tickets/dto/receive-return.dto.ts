import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReceiveReturnDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

