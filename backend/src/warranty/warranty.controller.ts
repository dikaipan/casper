import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarrantyService } from './warranty.service';
import { CreateWarrantyConfigDto, UpdateWarrantyConfigDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, AllowUserTypes, UserType } from '../common/decorators/roles.decorator';
import { WarrantyType } from '@prisma/client';

@ApiTags('warranty')
@Controller('warranty')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Get('config/:customerBankId')
  @ApiOperation({ summary: 'Get all warranty configurations for a customer bank' })
  @AllowUserTypes(UserType.HITACHI)
  @Roles('RC_STAFF', 'RC_MANAGER', 'SUPER_ADMIN')
  getWarrantyConfigs(@Param('customerBankId') customerBankId: string) {
    return this.warrantyService.getWarrantyConfigs(customerBankId);
  }

  @Post('config/:customerBankId')
  @ApiOperation({ summary: 'Create or update warranty configuration for a customer bank' })
  @AllowUserTypes(UserType.HITACHI)
  @Roles('RC_MANAGER', 'SUPER_ADMIN')
  async createOrUpdateWarrantyConfig(
    @Param('customerBankId') customerBankId: string,
    @Body() createDto: CreateWarrantyConfigDto,
  ) {
    return this.warrantyService.createOrUpdateWarrantyConfig(customerBankId, createDto);
  }

  @Patch('config/:customerBankId/:warrantyType')
  @ApiOperation({ summary: 'Update warranty configuration' })
  @AllowUserTypes(UserType.HITACHI)
  @Roles('RC_MANAGER', 'SUPER_ADMIN')
  async updateWarrantyConfig(
    @Param('customerBankId') customerBankId: string,
    @Param('warrantyType') warrantyType: string,
    @Body() updateDto: UpdateWarrantyConfigDto,
  ) {
    return this.warrantyService.updateWarrantyConfig(
      customerBankId,
      warrantyType as WarrantyType,
      updateDto,
    );
  }

  @Get('status/:cassetteId')
  @ApiOperation({ summary: 'Check warranty status for a cassette' })
  @AllowUserTypes(UserType.HITACHI)
  @Roles('RC_STAFF', 'RC_MANAGER', 'SUPER_ADMIN')
  async checkWarrantyStatus(@Param('cassetteId') cassetteId: string) {
    const cassette = await this.warrantyService.getCassetteWithBank(cassetteId);
    return this.warrantyService.checkWarrantyStatus(
      cassetteId,
      cassette.customerBankId,
    );
  }

  @Get('statistics/:customerBankId')
  @ApiOperation({ summary: 'Get warranty statistics for a customer bank' })
  @AllowUserTypes(UserType.HITACHI)
  @Roles('RC_STAFF', 'RC_MANAGER', 'SUPER_ADMIN')
  getWarrantyStatistics(@Param('customerBankId') customerBankId: string) {
    return this.warrantyService.getWarrantyStatistics(customerBankId);
  }
}

