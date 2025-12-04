import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkBrokenDto {
  @ApiProperty({ 
    example: 'Sensor error - cassette not accepting bills',
    description: 'Reason why cassette is marked as broken'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

