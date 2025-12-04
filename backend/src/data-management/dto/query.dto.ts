import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({ 
    example: 'SELECT * FROM customers_banks LIMIT 10;',
    description: 'SQL SELECT query to execute'
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}

