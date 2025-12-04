import { IsString, IsOptional, IsDateString, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankPengelolaAssignmentDto {
  @ApiPropertyOptional({ example: 'CONTRACT-2024-001' })
  @IsString()
  @IsOptional()
  contractNumber?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  contractStartDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  contractEndDate?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['BNI-JKT-SUDIRMAN', 'BNI-JKT-THAMRIN'],
    description: 'Array of branch codes. If empty, Pengelola manages all branches of the bank. If specified, Pengelola only manages these specific branches.',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedBranches?: string[];

  @ApiPropertyOptional({
    example: 700,
    description: 'Jumlah maksimal kaset yang akan di-assign ke Pengelola ini. Jika tidak diisi, semua kaset dari bank akan dapat diakses Pengelola.',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  assignedCassetteCount?: number;
}

