import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PreventiveMaintenanceType } from '../../preventive-maintenance/dto/create-pm.dto';

export class CreateRepairTicketDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  cassetteId: string;

  @ApiProperty({ 
    example: 'Cassette jammed - sensor belt broken',
    description: 'Description of the issue reported by Pengelola'
  })
  @IsString()
  @IsNotEmpty()
  reportedIssue: string;

  @ApiPropertyOptional({ 
    enum: PreventiveMaintenanceType,
    default: PreventiveMaintenanceType.ROUTINE,
    description: 'Type of repair ticket: ROUTINE, ON_DEMAND_PENGELOLA, ON_DEMAND_HITACHI, or EMERGENCY'
  })
  @IsEnum(PreventiveMaintenanceType)
  @IsOptional()
  type?: PreventiveMaintenanceType;

  @ApiPropertyOptional({ 
    example: 'Physical damage visible on sensor unit',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

