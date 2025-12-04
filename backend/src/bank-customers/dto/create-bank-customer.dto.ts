import { IsString, IsNotEmpty, IsEnum, IsOptional, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class CreateBankCustomerDto {
  @ApiProperty({ example: 'BNI', description: 'Unique bank code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  bankCode: string;

  @ApiProperty({ example: 'PT Bank Negara Indonesia (Persero) Tbk', description: 'Bank name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bankName: string;

  @ApiPropertyOptional({ enum: OrganizationStatus, default: 'ACTIVE', description: 'Bank status' })
  @IsEnum(OrganizationStatus)
  @IsOptional()
  status?: OrganizationStatus;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Primary contact name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  primaryContactName?: string;

  @ApiPropertyOptional({ example: 'contact@bni.co.id', description: 'Primary contact email' })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  primaryContactEmail?: string;

  @ApiPropertyOptional({ example: '+6281234567890', description: 'Primary contact phone' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  primaryContactPhone?: string;
}

