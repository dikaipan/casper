import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RepairsService } from './repairs.service';
import { CreateRepairTicketDto, UpdateRepairTicketDto, CompleteRepairDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, AllowUserTypes, UserType } from '../common/decorators/roles.decorator';

@ApiTags('repairs')
@Controller('repairs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@AllowUserTypes(UserType.HITACHI)
@Roles('RC_STAFF', 'RC_MANAGER', 'SUPER_ADMIN')
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all repair tickets (RC Staff only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50, max: 1000)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by cassette serial number, reported issue, or bank name' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (RECEIVED, DIAGNOSING, ON_PROGRESS, COMPLETED)' })
  @ApiQuery({ name: 'dateFilter', required: false, description: 'Filter by date (TODAY, YESTERDAY, THIS_WEEK, THIS_MONTH, LAST_7_DAYS, LAST_30_DAYS)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (receivedAtRc, createdAt, status)' })
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
    
    return this.repairsService.findAll(
      req.user.userType,
      req.user.role,
      pageNum,
      limitNum,
      search,
      status || 'ALL', // Always send status, default to 'ALL'
      dateFilter || 'ALL', // Always send dateFilter, default to 'ALL' to show all data
      sortBy,
      validSortOrder,
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get repair statistics' })
  getStatistics() {
    return this.repairsService.getStatistics();
  }

  @Get('pending-return')
  @ApiOperation({ 
    summary: 'Get cassettes pending return (RC Staff only)',
    description: 'List cassettes with status IN_REPAIR that have completed repair & QC passed. These cassettes are ready to be shipped back to Pengelola.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50, max: 1000)' })
  getPendingReturns(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? Math.min(parseInt(limit, 10), 1000) : 50;
    return this.repairsService.getPendingReturns(pageNum, limitNum);
  }

  @Get('by-ticket/:ticketId')
  @ApiOperation({ summary: 'Get repair tickets by ticket ID (optimized for large data)' })
  findByTicketId(@Param('ticketId') ticketId: string, @Request() req) {
    return this.repairsService.findByTicketId(ticketId, req.user.userType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get repair ticket by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.repairsService.findOne(id, req.user.userType);
  }

  @Post('bulk-from-ticket/:ticketId')
  @ApiOperation({ 
    summary: 'Create repair tickets for all cassettes in a service order (RC Staff)',
    description: 'Bulk create repair tickets for multi-cassette SO. Updates ticket status to IN_PROGRESS and all cassettes to IN_REPAIR.'
  })
  createBulkFromTicket(@Param('ticketId') ticketId: string, @Request() req) {
    return this.repairsService.createBulkFromTicket(ticketId, req.user.id, req.user.userType);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create repair ticket (RC Staff)',
    description: 'Receive cassette at RC and create repair ticket. Cassette status will be updated to IN_REPAIR.'
  })
  create(@Body() createDto: CreateRepairTicketDto, @Request() req) {
    return this.repairsService.create(createDto, req.user.id, req.user.userType);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update repair ticket' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRepairTicketDto,
    @Request() req,
  ) {
    return this.repairsService.update(id, updateDto, req.user.id);
  }

  @Post(':id/take')
  @ApiOperation({ 
    summary: 'Take/Assign repair ticket to current user',
    description: 'Assign repair ticket to the current RC staff member. Any RC staff can take unassigned tickets or tickets assigned to themselves.'
  })
  takeTicket(@Param('id') id: string, @Request() req) {
    return this.repairsService.takeTicket(id, req.user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ 
    summary: 'Complete repair and perform QC',
    description: 'If QC passed, cassette returns to OK status. If failed, cassette is SCRAPPED.'
  })
  completeRepair(
    @Param('id') id: string,
    @Body() completeDto: CompleteRepairDto,
    @Request() req,
  ) {
    return this.repairsService.completeRepair(id, completeDto, req.user.id);
  }

  @Post('sync-service-order-status')
  @ApiOperation({ 
    summary: 'Sync service order status based on repair tickets completion',
    description: 'Fixes SOs that should be RESOLVED but are still IN_PROGRESS. Can sync all SOs or a specific SO by ticketId query param.'
  })
  @ApiQuery({ name: 'ticketId', required: false, description: 'Optional: Sync specific SO by ticket ID' })
  syncServiceOrderStatus(@Query('ticketId') ticketId?: string) {
    return this.repairsService.syncServiceOrderStatus(ticketId);
  }

  @Delete(':id')
  @Roles('RC_MANAGER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete repair ticket (RC Manager and Super Admin only)' })
  delete(@Param('id') id: string, @Request() req) {
    return this.repairsService.softDelete(id, req.user.id, req.user.role);
  }
}

