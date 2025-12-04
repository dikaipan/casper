import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MaintenanceAction {
  VACUUM = 'vacuum',
  ANALYZE = 'analyze',
  REINDEX = 'reindex',
  CLEAN_LOGS = 'clean logs',
}

export class MaintenanceDto {
  @ApiProperty({ 
    enum: MaintenanceAction,
    example: 'vacuum',
    description: 'Maintenance action to perform'
  })
  @IsEnum(MaintenanceAction)
  @IsNotEmpty()
  action: MaintenanceAction;
}

