import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankCustomersService } from './bank-customers.service';
import { CreateBankCustomerDto, UpdateBankCustomerDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, AllowUserTypes, UserType } from '../common/decorators/roles.decorator';

@ApiTags('bank-customers')
@Controller('bank-customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BankCustomersController {
  constructor(private readonly bankCustomersService: BankCustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bank customers' })
  findAll() {
    return this.bankCustomersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank customer by ID' })
  findOne(@Param('id') id: string) {
    return this.bankCustomersService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get bank customer statistics' })
  getStatistics(@Param('id') id: string) {
    return this.bankCustomersService.getStatistics(id);
  }

  @Post()
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create new bank customer (Super Admin only)' })
  create(@Body() createBankCustomerDto: CreateBankCustomerDto) {
    return this.bankCustomersService.create(createBankCustomerDto);
  }

  @Patch(':id')
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update bank customer (Super Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateBankCustomerDto: UpdateBankCustomerDto,
  ) {
    return this.bankCustomersService.update(id, updateBankCustomerDto);
  }

  @Delete(':id')
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete bank customer (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.bankCustomersService.remove(id);
  }
}

