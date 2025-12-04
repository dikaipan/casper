import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional, MinLength } from 'class-validator';
import { HitachiUserRole, HitachiUserDepartment } from '@prisma/client';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class CreateHitachiUserDto {
  @ApiProperty({ example: 'rcstaff1' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'rcstaff1@hitachi.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'SecurePass123!',
    description: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: HitachiUserRole, default: 'RC_STAFF' })
  @IsEnum(HitachiUserRole)
  role: HitachiUserRole;

  @ApiProperty({ enum: HitachiUserDepartment, default: 'REPAIR_CENTER' })
  @IsEnum(HitachiUserDepartment)
  department: HitachiUserDepartment;
}

