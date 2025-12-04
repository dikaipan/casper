import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class CreateBankDto {
  @ApiProperty({ example: 'BNI' })
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @ApiProperty({ example: 'PT Bank Negara Indonesia (Persero) Tbk' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiPropertyOptional({ enum: OrganizationStatus, default: 'ACTIVE' })
  @IsEnum(OrganizationStatus)
  @IsOptional()
  status?: OrganizationStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  primaryContactName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  primaryContactEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  primaryContactPhone?: string;
}

