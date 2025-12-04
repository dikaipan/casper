import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecordDto {
  @ApiProperty({ 
    description: 'Record data to update',
    example: { bankName: 'Updated Bank Name', status: 'ACTIVE' }
  })
  @IsObject()
  data: Record<string, any>;
}

