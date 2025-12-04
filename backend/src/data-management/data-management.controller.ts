import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { DataManagementService } from './data-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, AllowUserTypes, UserType } from '../common/decorators/roles.decorator';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { MaintenanceDto, QueryDto, UpdateRecordDto } from './dto';

@ApiTags('data-management')
@Controller('data-management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@AllowUserTypes(UserType.HITACHI)
@Roles('SUPER_ADMIN')
export class DataManagementController {
  constructor(private readonly dataManagementService: DataManagementService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get database statistics (Super Admin only)' })
  async getDatabaseStats() {
    return this.dataManagementService.getDatabaseStats();
  }

  @Post('query')
  @ApiOperation({ summary: 'Execute SQL query (SELECT only, Super Admin only)' })
  @ApiBody({ type: QueryDto })
  async executeQuery(@Body() body: QueryDto) {
    return this.dataManagementService.executeQuery(body.query);
  }

  @Post('maintenance')
  @ApiOperation({ summary: 'Perform database maintenance (Super Admin only)' })
  @ApiBody({ type: MaintenanceDto })
  async performMaintenance(@Body() body: MaintenanceDto) {
    return this.dataManagementService.performMaintenance(body.action);
  }

  @Get('tables/:tableName')
  @ApiOperation({ summary: 'Get table data with pagination (Super Admin only)' })
  @ApiParam({ name: 'tableName', description: 'Table name' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTableData(
    @Param('tableName') tableName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dataManagementService.getTableData(
      tableName,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('tables/:tableName/:id')
  @ApiOperation({ summary: 'Get single record by ID (Super Admin only)' })
  @ApiParam({ name: 'tableName', description: 'Table name' })
  @ApiParam({ name: 'id', description: 'Record ID' })
  async getTableRecord(@Param('tableName') tableName: string, @Param('id') id: string) {
    return this.dataManagementService.getTableRecord(tableName, id);
  }

  @Patch('tables/:tableName/:id')
  @ApiOperation({ summary: 'Update record (Super Admin only)' })
  @ApiParam({ name: 'tableName', description: 'Table name' })
  @ApiParam({ name: 'id', description: 'Record ID' })
  @ApiBody({ type: UpdateRecordDto })
  async updateTableRecord(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @Body() body: UpdateRecordDto,
  ) {
    return this.dataManagementService.updateTableRecord(tableName, id, body.data);
  }

  @Delete('tables/:tableName/:id')
  @ApiOperation({ summary: 'Delete record (Super Admin only)' })
  @ApiParam({ name: 'tableName', description: 'Table name' })
  @ApiParam({ name: 'id', description: 'Record ID' })
  async deleteTableRecord(@Param('tableName') tableName: string, @Param('id') id: string) {
    return this.dataManagementService.deleteTableRecord(tableName, id);
  }

  @Post('backup')
  @ApiOperation({ summary: 'Create database backup (Super Admin only)' })
  async createBackup() {
    return this.dataManagementService.createBackup();
  }

  @Get('backups')
  @ApiOperation({ summary: 'List all backups (Super Admin only)' })
  async listBackups() {
    return this.dataManagementService.listBackups();
  }

  @Get('backups/:filename')
  @ApiOperation({ summary: 'Download backup file (Super Admin only)' })
  @ApiParam({ name: 'filename', description: 'Backup filename' })
  async downloadBackup(@Param('filename') filename: string, @Res() res: Response) {
    const backup = await this.dataManagementService.listBackups();
    const backupFile = backup.find(b => b.filename === filename);
    
    if (!backupFile) {
      return res.status(404).json({ message: 'Backup file not found' });
    }

    const filePath = path.join(process.cwd(), 'backups', filename);
    return res.download(filePath, filename);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Restore database from backup (Super Admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `restore-${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  async restoreBackup(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No backup file provided');
    }
    return this.dataManagementService.restoreBackup(file.path);
  }
}

