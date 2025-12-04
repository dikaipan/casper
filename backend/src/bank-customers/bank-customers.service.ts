import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankCustomerDto, UpdateBankCustomerDto } from './dto';

@Injectable()
export class BankCustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const banks = await this.prisma.customerBank.findMany({
      include: {
        pengelolaAssignments: {
          include: {
            pengelola: {
              select: {
                id: true,
                pengelolaCode: true,
                companyName: true,
                companyAbbreviation: true,
              },
            },
          },
        },
        warrantyConfigurations: {
          select: {
            warrantyType: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            machines: true,
            cassettes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add warranty status summary to each bank
    return banks.map((bank) => {
      // Filter only active warranty configurations
      // Note: isActive can be boolean true or undefined/null, so we check explicitly
      const activeWarrantyTypes = bank.warrantyConfigurations
        .filter((config) => {
          // Check if isActive is explicitly true
          return config.isActive === true;
        })
        .map((config) => config.warrantyType);
      
      let warrantyStatus = 'No Warranty';
      if (activeWarrantyTypes.length > 0) {
        // Format warranty types for display
        const warrantyTypeLabels: Record<string, string> = {
          MA: 'MA',
          MS: 'MS',
          IN_WARRANTY: 'IN',
          OUT_WARRANTY: 'OUT',
        };
        const formattedTypes = activeWarrantyTypes
          .map((type) => warrantyTypeLabels[type] || type)
          .join(', ');
        warrantyStatus = `Active (${formattedTypes})`;
      }

      return {
        ...bank,
        warrantyStatus,
        activeWarrantyTypes,
      };
    });
  }

  async findOne(id: string) {
    const bankCustomer = await this.prisma.customerBank.findUnique({
      where: { id },
      include: {
        pengelolaAssignments: {
          include: {
            pengelola: true,
          },
        },
        machines: {
          select: {
            id: true,
            machineCode: true,
            modelName: true,
            branchCode: true,
            status: true,
          },
        },
        cassettes: {
          select: {
            id: true,
            serialNumber: true,
            status: true,
          },
        },
      },
    });

    if (!bankCustomer) {
      throw new NotFoundException(`Bank customer with ID ${id} not found`);
    }

    return bankCustomer;
  }

  async create(createBankCustomerDto: CreateBankCustomerDto) {
    // Check if bank code already exists
    const existingBank = await this.prisma.customerBank.findUnique({
      where: { bankCode: createBankCustomerDto.bankCode },
    });

    if (existingBank) {
      throw new ConflictException(
        `Bank customer with code ${createBankCustomerDto.bankCode} already exists`,
      );
    }

    return this.prisma.customerBank.create({
      data: createBankCustomerDto as any,
    });
  }

  async update(id: string, updateBankCustomerDto: UpdateBankCustomerDto) {
    const bankCustomer = await this.findOne(id);

    // If updating bank code, check for conflicts
    if (
      updateBankCustomerDto.bankCode &&
      updateBankCustomerDto.bankCode !== bankCustomer.bankCode
    ) {
      const existingBank = await this.prisma.customerBank.findUnique({
        where: { bankCode: updateBankCustomerDto.bankCode },
      });

      if (existingBank) {
        throw new ConflictException(
          `Bank customer with code ${updateBankCustomerDto.bankCode} already exists`,
        );
      }
    }

    return this.prisma.customerBank.update({
      where: { id },
      data: updateBankCustomerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if bank customer has machines
    const machineCount = await this.prisma.machine.count({
      where: { customerBankId: id },
    });

    if (machineCount > 0) {
      throw new ConflictException(
        `Cannot delete bank customer with ${machineCount} associated machines`,
      );
    }

    // Check if bank customer has cassettes
    const cassetteCount = await this.prisma.cassette.count({
      where: { customerBankId: id },
    });

    if (cassetteCount > 0) {
      throw new ConflictException(
        `Cannot delete bank customer with ${cassetteCount} associated cassettes`,
      );
    }

    return this.prisma.customerBank.delete({
      where: { id },
    });
  }

  async getStatistics(id: string) {
    await this.findOne(id);

    const [totalMachines, operationalMachines, totalCassettes, spareCassettes] =
      await Promise.all([
        this.prisma.machine.count({
          where: { customerBankId: id },
        }),
        this.prisma.machine.count({
          where: { customerBankId: id, status: 'OPERATIONAL' },
        }),
        this.prisma.cassette.count({
          where: { customerBankId: id },
        }),
        this.prisma.cassette.count({
          where: { customerBankId: id, status: 'OK' as any },
        }),
      ]);

    return {
      totalMachines,
      operationalMachines,
      maintenanceMachines: totalMachines - operationalMachines,
      totalCassettes,
      spareCassettes,
      installedCassettes: totalCassettes - spareCassettes,
    };
  }
}

