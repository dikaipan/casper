import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProblemTicketPriority } from './create-ticket.dto';

export class CassetteDetailDto {
  @ApiProperty({ example: 'RB-BNI-0001', description: 'Serial Number of the cassette' })
  @IsString()
  @IsNotEmpty()
  cassetteSerialNumber: string;

  @ApiProperty({ example: 'Machine not accepting bills' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Customer reported that machine shows error E101' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: ProblemTicketPriority, default: 'MEDIUM' })
  @IsEnum(ProblemTicketPriority)
  @IsOptional()
  priority?: ProblemTicketPriority;

  @ApiPropertyOptional({ 
    type: [String],
    example: ['Cassette RB-1', 'Sensor Unit'],
    description: 'List of affected components'
  })
  @IsArray()
  @IsOptional()
  affectedComponents?: string[];

  @ApiPropertyOptional({ example: 'WS-BNI-JKT-001', description: 'Optional WSID' })
  @IsString()
  @IsOptional()
  wsid?: string;

  @ApiPropertyOptional({ example: 'E101', description: 'Optional error code' })
  @IsString()
  @IsOptional()
  errorCode?: string;

  @ApiPropertyOptional({ example: true, description: 'Request cassette replacement (cassette is unserviceable) - Note: This property is deprecated, use root-level requestReplacement instead' })
  @IsBoolean()
  @IsOptional()
  requestReplacement?: boolean;

  @ApiPropertyOptional({ example: 'Kaset rusak fisik parah, komponen utama tidak dapat diperbaiki', description: 'Reason why cassette is unserviceable and needs replacement - Note: This property is deprecated, use root-level replacementReason instead' })
  @IsString()
  @IsOptional()
  replacementReason?: string;
}

