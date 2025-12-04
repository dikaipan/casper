import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWsidDto {
  @ApiProperty({ 
    example: 'WS-BNI-JKT-002',
    description: 'New WSID assigned by the bank'
  })
  @IsString()
  @IsNotEmpty()
  newWsid: string;

  @ApiPropertyOptional({ 
    example: 'Bank restructured branch codes',
    description: 'Reason for WSID change (for audit trail)'
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

