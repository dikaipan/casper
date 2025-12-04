import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeliveryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsString()
  @IsNotEmpty()
  cassetteId: string;

  @ApiProperty({ example: '2025-01-20' })
  @IsDateString()
  @IsNotEmpty()
  shippedDate: string;

  @ApiPropertyOptional({ example: 'JNE' })
  @IsString()
  @IsOptional()
  courierService?: string;

  @ApiPropertyOptional({ example: 'JNE123456789' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: '2025-01-22' })
  @IsDateString()
  @IsOptional()
  estimatedArrival?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

