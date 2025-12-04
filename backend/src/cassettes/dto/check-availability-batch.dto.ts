import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckAvailabilityBatchDto {
  @ApiProperty({
    description: 'Array of cassette IDs to check availability',
    example: ['uuid1', 'uuid2', 'uuid3'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  cassetteIds: string[];
}

