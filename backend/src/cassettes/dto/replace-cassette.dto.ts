import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReplaceCassetteDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the old cassette that needs to be replaced (will be marked as SCRAPPED)'
  })
  @IsString()
  @IsNotEmpty()
  oldCassetteId: string;

  @ApiProperty({ 
    example: 'RB-BNI-0002',
    description: 'Serial Number of the new replacement cassette'
  })
  @IsString()
  @IsNotEmpty()
  newSerialNumber: string;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID of the replacement ticket'
  })
  @IsString()
  @IsNotEmpty()
  replacementTicketId: string;

  @ApiPropertyOptional({ 
    example: 'Kaset baru untuk menggantikan kaset lama yang tidak layak pakai',
    description: 'Optional notes for the replacement'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

