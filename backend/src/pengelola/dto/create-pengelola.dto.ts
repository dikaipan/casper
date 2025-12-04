import { IsString, IsOptional, IsEnum, MinLength, MaxLength, IsEmail, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePengelolaDto {
  @ApiProperty({ example: 'PGL-TAG-001' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  pengelolaCode: string;

  @ApiProperty({ example: 'PT Teknologi Andalan Global' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  companyName: string;

  @ApiProperty({ example: 'TAG' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  companyAbbreviation: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessRegistrationNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Jakarta' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  primaryContactName?: string;

  @ApiPropertyOptional({ example: 'contact@tag.co.id' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  primaryContactEmail?: string;

  @ApiPropertyOptional({ example: '+62-21-1234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  primaryContactPhone?: string;

  @ApiPropertyOptional({ example: 'https://tag.co.id' })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

