import { IsEnum, IsInt, IsBoolean, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WarrantyType } from '@prisma/client';

export class CreateWarrantyConfigDto {
  @ApiProperty({ 
    enum: WarrantyType,
    description: 'Warranty type (MA, MS, IN_WARRANTY, OUT_WARRANTY)'
  })
  @IsEnum(WarrantyType)
  warrantyType: WarrantyType;

  @ApiPropertyOptional({ 
    description: 'Warranty period in days (default: 30 for IN_WARRANTY, 60 for MS, 90 for MA)',
    example: 90
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  warrantyPeriodDays?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum warranty claims allowed (default: 1). Ignored if unlimitedClaims is true.',
    example: 2
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  maxWarrantyClaims?: number;

  @ApiPropertyOptional({ 
    description: 'Allow unlimited claims as long as warranty is active (default: false)',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  unlimitedClaims?: boolean;

  @ApiPropertyOptional({ 
    description: 'Additional warranty days when claim is made (default: 0)',
    example: 30
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  warrantyExtensionDays?: number;

  @ApiPropertyOptional({ 
    description: 'Requires approval for warranty claims (default: false)',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ 
    description: 'Auto approve first warranty claim (default: true)',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  autoApproveFirstClaim?: boolean;

  @ApiPropertyOptional({ 
    description: 'Free repair if under warranty (default: false for MS, true for MA/IN_WARRANTY)',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  freeRepairOnWarranty?: boolean;

  @ApiPropertyOptional({ 
    description: 'Additional notes',
    example: 'Special warranty terms for this customer'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Activate or deactivate this warranty configuration',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

