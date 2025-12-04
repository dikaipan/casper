import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProblemTicketPriority } from './create-ticket.dto';

export enum ProblemTicketStatus {
  OPEN = 'OPEN',
  IN_DELIVERY = 'IN_DELIVERY',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export class UpdateTicketDto {
  @ApiPropertyOptional({ enum: ProblemTicketStatus })
  @IsEnum(ProblemTicketStatus)
  @IsOptional()
  status?: ProblemTicketStatus;

  @ApiPropertyOptional({ enum: ProblemTicketPriority })
  @IsEnum(ProblemTicketPriority)
  @IsOptional()
  priority?: ProblemTicketPriority;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}

