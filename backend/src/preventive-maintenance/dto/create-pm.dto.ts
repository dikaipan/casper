import { IsString, IsEnum, IsDateString, IsOptional, IsUUID, IsInt, IsObject, IsArray, ValidateIf, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PreventiveMaintenanceType {
  ROUTINE = 'ROUTINE',
  ON_DEMAND_PENGELOLA = 'ON_DEMAND_PENGELOLA',
  ON_DEMAND_HITACHI = 'ON_DEMAND_HITACHI',
  EMERGENCY = 'EMERGENCY',
}

export enum PreventiveMaintenanceLocation {
  BANK_LOCATION = 'BANK_LOCATION',
  PENGELOLA_LOCATION = 'PENGELOLA_LOCATION',
  REPAIR_CENTER = 'REPAIR_CENTER',
}

export class CreatePreventiveMaintenanceDto {
  @ApiProperty({ description: 'Cassette IDs (array for multi-cassette PM, min: 1, max: 30 cassettes per PM)' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1, { message: 'At least 1 cassette is required' })
  @ArrayMaxSize(30, { message: 'Maximum 30 cassettes per PM task' })
  cassetteIds: string[];

  @ApiProperty({ enum: PreventiveMaintenanceType, default: PreventiveMaintenanceType.ROUTINE })
  @IsEnum(PreventiveMaintenanceType)
  type: PreventiveMaintenanceType;

  @ApiPropertyOptional({ enum: PreventiveMaintenanceLocation, default: PreventiveMaintenanceLocation.PENGELOLA_LOCATION })
  @IsOptional()
  @IsEnum(PreventiveMaintenanceLocation)
  location?: PreventiveMaintenanceLocation;

  @ApiProperty({ description: 'Scheduled date (ISO string)' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ description: 'Scheduled time range (e.g., "09:00-12:00")' })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiProperty({ description: 'PM Title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'PM Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Assigned engineer ID' })
  @IsOptional()
  @IsUUID()
  assignedEngineer?: string;

  @ApiPropertyOptional({ description: 'Contact name at location' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Location address' })
  @IsOptional()
  @IsString()
  locationAddress?: string;

  @ApiPropertyOptional({ description: 'Location city' })
  @IsOptional()
  @IsString()
  locationCity?: string;

  @ApiPropertyOptional({ description: 'Location province' })
  @IsOptional()
  @IsString()
  locationProvince?: string;

  @ApiPropertyOptional({ description: 'Location postal code' })
  @IsOptional()
  @IsString()
  locationPostalCode?: string;

  @ApiPropertyOptional({ description: 'Next PM interval in days' })
  @IsOptional()
  @IsInt()
  nextPmInterval?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

