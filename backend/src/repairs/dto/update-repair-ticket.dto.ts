import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum RepairTicketStatus {
  RECEIVED = 'RECEIVED',
  DIAGNOSING = 'DIAGNOSING',
  ON_PROGRESS = 'ON_PROGRESS',
  COMPLETED = 'COMPLETED',
  SCRAPPED = 'SCRAPPED',
}

export class UpdateRepairTicketDto {
  @ApiPropertyOptional({ enum: RepairTicketStatus })
  @IsEnum(RepairTicketStatus)
  @IsOptional()
  status?: RepairTicketStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  repairActionTaken?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  partsReplaced?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  repairedBy?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

