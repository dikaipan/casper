import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteRepairDto {
  @ApiProperty({ 
    example: 'Replaced sensor belt and recalibrated unit',
    description: 'Description of repair actions performed'
  })
  @IsString()
  @IsNotEmpty()
  repairActionTaken: string;

  @ApiPropertyOptional({ 
    type: [String],
    example: ['Sensor Belt Model SB-100', 'Roller Kit RK-50'],
    description: 'List of parts replaced during repair'
  })
  @IsArray()
  @IsOptional()
  partsReplaced?: any;

  @ApiProperty({ 
    example: true,
    description: 'Did the cassette pass QC? If true, cassette is returned to pengelola in OK status. If false, scrapped.'
  })
  @IsBoolean()
  @IsNotEmpty()
  qcPassed: boolean;
}

