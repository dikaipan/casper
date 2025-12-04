import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseTicketDto {
  @ApiProperty({ 
    example: 'Cassette was replaced and machine is now operational',
    description: 'Resolution notes explaining how the issue was resolved'
  })
  @IsString()
  @IsNotEmpty()
  resolutionNotes: string;
}

