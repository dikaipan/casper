import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, AllowUserTypes, UserType } from '../common/decorators/roles.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@AllowUserTypes(UserType.HITACHI)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('operational-metrics')
  @ApiOperation({ summary: 'Get operational performance metrics (MTTR, MTBF, cycle time, turnaround time)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'bankId', required: false, type: String, description: 'Filter by bank ID' })
  @ApiQuery({ name: 'pengelolaId', required: false, type: String, description: 'Filter by pengelola ID' })
  getOperationalMetrics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bankId') bankId?: string,
    @Query('pengelolaId') pengelolaId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.analyticsService.getOperationalMetrics(
      req.user.userType,
      req.user.pengelolaId,
      start,
      end,
      bankId,
      pengelolaId,
    );
  }

  @Get('cassette-analytics')
  @ApiOperation({ summary: 'Get cassette analytics (top problematic, cycle problem, age, utilization)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'bankId', required: false, type: String, description: 'Filter by bank ID' })
  @ApiQuery({ name: 'pengelolaId', required: false, type: String, description: 'Filter by pengelola ID' })
  getCassetteAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bankId') bankId?: string,
    @Query('pengelolaId') pengelolaId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.analyticsService.getCassetteAnalytics(
      req.user.userType,
      req.user.pengelolaId,
      start,
      end,
      bankId,
      pengelolaId,
    );
  }

  @Get('repair-analytics')
  @ApiOperation({ summary: 'Get repair analytics (success rate, parts replacement, top issues)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'bankId', required: false, type: String, description: 'Filter by bank ID' })
  @ApiQuery({ name: 'pengelolaId', required: false, type: String, description: 'Filter by pengelola ID' })
  getRepairAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bankId') bankId?: string,
    @Query('pengelolaId') pengelolaId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.analyticsService.getRepairAnalytics(
      req.user.userType,
      req.user.pengelolaId,
      start,
      end,
      bankId,
      pengelolaId,
    );
  }

  @Get('service-order-analytics')
  @ApiOperation({ summary: 'Get Service Order (SO) analytics (trend, priority, bank, pengelola, resolution time)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'bankId', required: false, type: String, description: 'Filter by bank ID' })
  @ApiQuery({ name: 'pengelolaId', required: false, type: String, description: 'Filter by pengelola ID' })
  getServiceOrderAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bankId') bankId?: string,
    @Query('pengelolaId') pengelolaId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.analyticsService.getServiceOrderAnalytics(
      req.user.userType,
      req.user.pengelolaId,
      start,
      end,
      bankId,
      pengelolaId,
    );
  }

  @Get('pengelola-comparison')
  @ApiOperation({ summary: 'Get pengelola comparison analytics (performance metrics per pengelola)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO string)' })
  getPengelolaComparison(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.analyticsService.getPengelolaComparison(
      req.user.userType,
      req.user.pengelolaId,
      start,
      end,
    );
  }
}

