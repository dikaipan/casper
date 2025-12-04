import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Refresh token obtained from login',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

