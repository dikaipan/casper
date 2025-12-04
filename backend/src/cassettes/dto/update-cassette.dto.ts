import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CassetteStatus, CassetteUsageType } from './create-cassette.dto';

export class UpdateCassetteDto {
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsString()
  @IsOptional()
  machineId?: string;

  @ApiPropertyOptional({ enum: CassetteUsageType, example: 'MAIN' })
  @IsEnum(CassetteUsageType)
  @IsOptional()
  usageType?: CassetteUsageType;

  @ApiPropertyOptional({ enum: CassetteStatus, example: 'OK' })
  @IsEnum(CassetteStatus)
  @IsOptional()
  status?: CassetteStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

