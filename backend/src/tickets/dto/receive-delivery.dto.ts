import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReceiveDeliveryDto {
  @ApiPropertyOptional({ 
    example: 'Cassette received in good condition',
    description: 'Optional notes for receipt'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

