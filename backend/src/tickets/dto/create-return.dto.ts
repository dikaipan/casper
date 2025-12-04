import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReturnDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @ApiPropertyOptional({ description: 'Catatan saat pickup dikonfirmasi' })
  @IsString()
  @IsOptional()
  notes?: string;
}

