import { PartialType } from '@nestjs/swagger';
import { CreateWarrantyConfigDto } from './create-warranty-config.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWarrantyConfigDto extends PartialType(CreateWarrantyConfigDto) {
  @ApiPropertyOptional({ 
    description: 'Activate or deactivate this warranty configuration',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

