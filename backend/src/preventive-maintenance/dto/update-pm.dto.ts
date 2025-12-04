import { IsString, IsEnum, IsDateString, IsOptional, IsUUID, IsInt, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum PreventiveMaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export class UpdatePreventiveMaintenanceDto {
  @ApiPropertyOptional({ enum: PreventiveMaintenanceStatus })
  @IsOptional()
  @IsEnum(PreventiveMaintenanceStatus)
  status?: PreventiveMaintenanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedEngineer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actionsTaken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  partsReplaced?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextPmDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  nextPmInterval?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  checklist?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancelledReason?: string;

  @ApiPropertyOptional({ description: 'Reason for rescheduling PM' })
  @IsOptional()
  @IsString()
  rescheduledReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

