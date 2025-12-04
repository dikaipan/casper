import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PreventiveMaintenanceService } from './preventive-maintenance.service';
import { PmSchedulerService } from './pm-scheduler.service';
import { PmCleanupService } from './pm-cleanup.service';
import { CreatePreventiveMaintenanceDto } from './dto/create-pm.dto';
import { UpdatePreventiveMaintenanceDto } from './dto/update-pm.dto';
import { Roles, AllowUserTypes, UserType } from '../common/decorators/roles.decorator';

@ApiTags('Preventive Maintenance')
@Controller('preventive-maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PreventiveMaintenanceController {
  constructor(
    private readonly preventiveMaintenanceService: PreventiveMaintenanceService,
    private readonly pmSchedulerService: PmSchedulerService,
    private readonly pmCleanupService: PmCleanupService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new preventive maintenance (Hitachi) or request PM (Pengelola)' })
  create(@Body() createDto: CreatePreventiveMaintenanceDto, @Request() req) {
    return this.preventiveMaintenanceService.create(
      createDto,
      req.user.id,
      req.user.userType,
      req.user.pengelolaId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all preventive maintenances (filtered by user permissions)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50, max: 1000)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by PM number, title, cassette serial number, or engineer name' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED)' })
  @ApiQuery({ name: 'dateFilter', required: false, description: 'Filter by date (TODAY, YESTERDAY, THIS_WEEK, THIS_MONTH, LAST_7_DAYS, LAST_30_DAYS)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (scheduledDate, createdAt, status)' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order: asc or desc (default: desc)' })
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('dateFilter') dateFilter?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? Math.min(parseInt(limit, 10), 1000) : 50;
    const validSortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';
    
    return this.preventiveMaintenanceService.findAll(
      req.user.userType,
      req.user.userType === 'PENGELOLA' ? req.user.id : req.user.pengelolaId,
      pageNum,
      limitNum,
      search,
      status && status !== 'ALL' ? status : undefined,
      dateFilter && dateFilter !== 'ALL' ? dateFilter : undefined,
      sortBy,
      validSortOrder,
    );
  }

  @Get('count/unassigned')
  @ApiOperation({ summary: 'Get count of unassigned PM tasks or tasks assigned to current user for badge notification' })
  getUnassignedPMTasksCount(@Request() req) {
    return this.preventiveMaintenanceService.getUnassignedPMTasksCount(req.user.userType, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get preventive maintenance by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.preventiveMaintenanceService.findOne(
      id,
      req.user.userType,
      req.user.userType === 'PENGELOLA' ? req.user.id : req.user.pengelolaId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update preventive maintenance' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePreventiveMaintenanceDto,
    @Request() req,
  ) {
    return this.preventiveMaintenanceService.update(
      id,
      updateDto,
      req.user.id,
      req.user.userType,
    );
  }

  @Patch(':id/cassette/:cassetteId')
  @ApiOperation({ summary: 'Update cassette detail in PM' })
  updateCassetteDetail(
    @Param('id') pmId: string,
    @Param('cassetteId') cassetteId: string,
    @Body() updateData: {
      checklist?: any;
      findings?: string;
      actionsTaken?: string;
      partsReplaced?: any;
      status?: string;
      notes?: string;
    },
    @Request() req,
  ) {
    return this.preventiveMaintenanceService.updateCassetteDetail(
      pmId,
      cassetteId,
      updateData,
      req.user.id,
      req.user.userType,
    );
  }

  @Post(':id/take')
  @ApiOperation({ 
    summary: 'Take/Assign PM task to current user',
    description: 'Assign PM task to the current RC staff member. Any RC staff can take unassigned tasks or tasks assigned to themselves.'
  })
  takeTask(@Param('id') id: string, @Request() req) {
    return this.preventiveMaintenanceService.takeTask(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel preventive maintenance (Hitachi can cancel any, Pengelola can cancel their own requests)' })
  cancel(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.preventiveMaintenanceService.cancel(
      id,
      body.reason,
      req.user.id,
      req.user.userType,
      req.user.pengelolaId,
    );
  }

  @Post(':id/disable-auto-schedule')
  @ApiOperation({ summary: 'Disable auto-scheduling for routine PM (cancel future PM plan)' })
  disableAutoSchedule(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.preventiveMaintenanceService.disableAutoSchedule(
      id,
      req.user.id,
      req.user.userType,
      req.user.pengelolaId,
    );
  }

  @Post('auto-schedule/trigger')
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN', 'RC_MANAGER')
  @ApiOperation({ summary: 'Manually trigger auto-scheduling for routine PM (Hitachi only)' })
  triggerAutoSchedule() {
    return this.pmSchedulerService.triggerAutoSchedule();
  }

  @Delete(':id')
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN', 'RC_MANAGER')
  @ApiOperation({ summary: 'Delete preventive maintenance (Super Admin and RC Manager only)' })
  delete(@Param('id') id: string, @Request() req) {
    return this.preventiveMaintenanceService.delete(id, req.user.id, req.user.role);
  }

  @Post('cleanup/run')
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Manually trigger cleanup of old soft-deleted PMs (Super Admin only)' })
  async runCleanup(@Body() body?: { retentionYears?: number }) {
    return this.pmCleanupService.manualCleanup(body?.retentionYears);
  }

  @Post('cleanup/repair-tickets')
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Manually trigger cleanup of old soft-deleted repair tickets (Super Admin only)' })
  async runRepairTicketsCleanup(@Body() body?: { retentionYears?: number }) {
    return this.pmCleanupService.manualCleanupRepairTickets(body?.retentionYears);
  }

  @Post('cleanup/problem-tickets')
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Manually trigger cleanup of old soft-deleted problem tickets (Super Admin only)' })
  async runProblemTicketsCleanup(@Body() body?: { retentionYears?: number }) {
    return this.pmCleanupService.manualCleanupProblemTickets(body?.retentionYears);
  }
}

