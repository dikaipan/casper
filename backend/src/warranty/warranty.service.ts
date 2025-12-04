import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WarrantyType } from '@prisma/client';

@Injectable()
export class WarrantyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get warranty configuration untuk customer bank tertentu
   */
  async getWarrantyConfig(customerBankId: string, warrantyType: WarrantyType) {
    const config = await this.prisma.warrantyConfiguration.findUnique({
      where: {
        customerBankId_warrantyType: {
          customerBankId,
          warrantyType,
        },
      },
    });

    // Jika tidak ada config, return default
    if (!config) {
      return {
        ...this.getDefaultWarrantyConfig(warrantyType),
        unlimitedClaims: false, // Ensure unlimitedClaims is always present
      };
    }

    // Ensure unlimitedClaims is present (for existing records that might not have it)
    return {
      ...config,
      unlimitedClaims: config.unlimitedClaims ?? false,
    };
  }

  /**
   * Get all warranty configs untuk customer bank
   */
  async getWarrantyConfigs(customerBankId: string) {
    const configs = await this.prisma.warrantyConfiguration.findMany({
      where: {
        customerBankId,
        // Get all configs, not just active ones, so user can see and manage all warranty types
      },
      orderBy: {
        warrantyType: 'asc',
      },
    });

    // Return dengan default untuk yang belum ada
    const allTypes: WarrantyType[] = ['MA', 'MS', 'IN_WARRANTY', 'OUT_WARRANTY'];
    const result = allTypes.map((type) => {
      const config = configs.find((c) => c.warrantyType === type);
      if (config) {
        return config;
      }
      return {
        id: null,
        customerBankId,
        warrantyType: type,
        ...this.getDefaultWarrantyConfig(type),
        isActive: false,
        createdAt: null,
        updatedAt: null,
      };
    });

    return result;
  }

  /**
   * Default warranty config berdasarkan type
   */
  private getDefaultWarrantyConfig(warrantyType: WarrantyType) {
    const defaults = {
      MA: {
        warrantyPeriodDays: 90,
        maxWarrantyClaims: 2,
        unlimitedClaims: false,
        warrantyExtensionDays: 30,
        requiresApproval: false,
        autoApproveFirstClaim: true,
        freeRepairOnWarranty: true,
      },
      MS: {
        warrantyPeriodDays: 60,
        maxWarrantyClaims: 1,
        unlimitedClaims: false,
        warrantyExtensionDays: 15,
        requiresApproval: true,
        autoApproveFirstClaim: true,
        freeRepairOnWarranty: false,
      },
      IN_WARRANTY: {
        warrantyPeriodDays: 30,
        maxWarrantyClaims: 1,
        unlimitedClaims: false,
        warrantyExtensionDays: 0,
        requiresApproval: false,
        autoApproveFirstClaim: true,
        freeRepairOnWarranty: true,
      },
      OUT_WARRANTY: {
        warrantyPeriodDays: 0,
        maxWarrantyClaims: 0,
        unlimitedClaims: false,
        warrantyExtensionDays: 0,
        requiresApproval: false,
        autoApproveFirstClaim: false,
        freeRepairOnWarranty: false,
      },
    };

    return defaults[warrantyType];
  }

  /**
   * Determine warranty type untuk repair berdasarkan customer bank
   * Logic: Cek config aktif, jika ada MA gunakan MA, jika ada MS gunakan MS, default IN_WARRANTY
   */
  async determineWarrantyType(customerBankId: string): Promise<WarrantyType> {
    const configs = await this.prisma.warrantyConfiguration.findMany({
      where: {
        customerBankId,
        isActive: true,
      },
      orderBy: {
        warrantyType: 'asc',
      },
    });

    // Priority: MA > MS > IN_WARRANTY
    if (configs.some((c) => c.warrantyType === 'MA')) {
      return 'MA';
    }
    if (configs.some((c) => c.warrantyType === 'MS')) {
      return 'MS';
    }

    // Default: IN_WARRANTY
    return 'IN_WARRANTY';
  }

  /**
   * Calculate warranty dates untuk repair
   */
  async calculateWarranty(
    customerBankId: string,
    warrantyType: WarrantyType,
    completedAt: Date,
    previousWarrantyClaimCount: number = 0,
  ) {
    const config = await this.getWarrantyConfig(customerBankId, warrantyType);

    // Calculate warranty period
    let warrantyPeriodDays = config.warrantyPeriodDays;

    // Jika ada extension dari claim sebelumnya
    if (previousWarrantyClaimCount > 0 && config.warrantyExtensionDays) {
      warrantyPeriodDays += config.warrantyExtensionDays;
    }

    const warrantyStartDate = new Date(completedAt);
    const warrantyEndDate = new Date(completedAt);
    warrantyEndDate.setDate(warrantyEndDate.getDate() + warrantyPeriodDays);

    return {
      warrantyType,
      warrantyPeriodDays,
      warrantyStartDate,
      warrantyEndDate,
      config,
    };
  }

  /**
   * Get cassette with customer bank
   */
  async getCassetteWithBank(cassetteId: string) {
    const cassette = await this.prisma.cassette.findUnique({
      where: { id: cassetteId },
      include: { customerBank: true },
    });

    if (!cassette) {
      throw new NotFoundException('Cassette not found');
    }

    return cassette;
  }

  /**
   * Check apakah repair masih dalam periode garansi
   */
  async checkWarrantyStatus(cassetteId: string, customerBankId: string) {
    // Cari repair terakhir yang completed dan QC passed
    const lastCompletedRepair = await this.prisma.repairTicket.findFirst({
      where: {
        cassetteId,
        status: 'COMPLETED',
        qcPassed: true,
        warrantyEndDate: {
          gte: new Date(), // Masih dalam periode garansi
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (!lastCompletedRepair || !lastCompletedRepair.warrantyType) {
      return {
        isUnderWarranty: false,
        warrantyType: null,
      };
    }

    if (!lastCompletedRepair.warrantyEndDate) {
      return {
        isUnderWarranty: false,
        warrantyType: null,
      };
    }

    const now = new Date();
    const daysRemaining = Math.ceil(
      (lastCompletedRepair.warrantyEndDate.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (!lastCompletedRepair.warrantyType) {
      return {
        isUnderWarranty: false,
        warrantyType: null,
      };
    }

    const config = await this.getWarrantyConfig(
      customerBankId,
      lastCompletedRepair.warrantyType,
    );

    // Check apakah masih bisa claim
    // Jika unlimitedClaims = true, maka claim bisa dilakukan selama warranty masih aktif
    const maxClaims = config.maxWarrantyClaims ?? 0;
    const isUnlimited = config.unlimitedClaims ?? false;
    
    let canClaimWarranty: boolean;
    if (isUnlimited) {
      // Unlimited claims: bisa claim selama warranty masih aktif (daysRemaining > 0)
      canClaimWarranty = daysRemaining > 0;
    } else {
      // Limited claims: cek apakah masih di bawah max claims
      canClaimWarranty = lastCompletedRepair.warrantyClaimCount < maxClaims;
    }

    return {
      isUnderWarranty: true,
      warrantyType: lastCompletedRepair.warrantyType,
      warrantyEndDate: lastCompletedRepair.warrantyEndDate,
      daysRemaining,
      originalRepairId: lastCompletedRepair.id,
      warrantyPeriodDays: lastCompletedRepair.warrantyPeriodDays ?? 0,
      warrantyClaimCount: lastCompletedRepair.warrantyClaimCount,
      maxWarrantyClaims: isUnlimited ? null : maxClaims, // null untuk unlimited
      unlimitedClaims: isUnlimited,
      canClaimWarranty,
      freeRepair: config.freeRepairOnWarranty,
      requiresApproval: config.requiresApproval,
    };
  }

  /**
   * Claim warranty untuk repair baru
   */
  async claimWarranty(
    newRepairId: string,
    originalRepairId: string,
    claimReason: string,
  ) {
    const originalRepair = await this.prisma.repairTicket.findUnique({
      where: { id: originalRepairId },
      include: { cassette: { include: { customerBank: true } } },
    });

    if (!originalRepair) {
      throw new NotFoundException('Original repair not found');
    }

    // Verify masih dalam periode garansi
    const warrantyStatus = await this.checkWarrantyStatus(
      originalRepair.cassetteId,
      originalRepair.cassette.customerBankId,
    );

    if (!warrantyStatus.isUnderWarranty) {
      throw new BadRequestException('Repair tidak dalam periode garansi');
    }

    if (!warrantyStatus.canClaimWarranty) {
      if (warrantyStatus.unlimitedClaims) {
        throw new BadRequestException('Periode garansi sudah berakhir');
      } else {
        throw new BadRequestException(
          `Maksimal ${warrantyStatus.maxWarrantyClaims} claim garansi sudah tercapai`,
        );
      }
    }

    if (!originalRepair.warrantyType) {
      throw new BadRequestException('Original repair does not have warranty type');
    }

    const config = await this.getWarrantyConfig(
      originalRepair.cassette.customerBankId,
      originalRepair.warrantyType,
    );

    // Update new repair sebagai warranty claim
    await this.prisma.repairTicket.update({
      where: { id: newRepairId },
      data: {
        isWarrantyRepair: true,
        originalRepairId: originalRepairId,
        warrantyClaimReason: claimReason,
        warrantyType: originalRepair.warrantyType, // Inherit warranty type
      },
    });

    // Update original repair
    await this.prisma.repairTicket.update({
      where: { id: originalRepairId },
      data: {
        warrantyClaimed: true,
        warrantyClaimCount: { increment: 1 },
      },
    });

    // Jika auto-approve atau first claim
    const shouldAutoApprove =
      config.autoApproveFirstClaim &&
      originalRepair.warrantyClaimCount === 0;

    return {
      success: true,
      warrantyType: originalRepair.warrantyType,
      freeRepair: config.freeRepairOnWarranty,
      requiresApproval: config.requiresApproval && !shouldAutoApprove,
      autoApproved: shouldAutoApprove,
    };
  }

  /**
   * Create or update warranty configuration
   */
  async createOrUpdateWarrantyConfig(
    customerBankId: string,
    createDto: {
      warrantyType: WarrantyType;
      warrantyPeriodDays?: number;
      maxWarrantyClaims?: number;
      unlimitedClaims?: boolean;
      warrantyExtensionDays?: number;
      requiresApproval?: boolean;
      autoApproveFirstClaim?: boolean;
      freeRepairOnWarranty?: boolean;
      notes?: string;
      isActive?: boolean;
    },
  ) {
    const existing = await this.prisma.warrantyConfiguration.findUnique({
      where: {
        customerBankId_warrantyType: {
          customerBankId,
          warrantyType: createDto.warrantyType,
        },
      },
    });

    if (existing) {
      // Update existing
      return this.prisma.warrantyConfiguration.update({
        where: { id: existing.id },
        data: {
          warrantyPeriodDays: createDto.warrantyPeriodDays,
          maxWarrantyClaims: createDto.unlimitedClaims ? null : createDto.maxWarrantyClaims,
          unlimitedClaims: createDto.unlimitedClaims ?? false,
          warrantyExtensionDays: createDto.warrantyExtensionDays,
          requiresApproval: createDto.requiresApproval,
          autoApproveFirstClaim: createDto.autoApproveFirstClaim,
          freeRepairOnWarranty: createDto.freeRepairOnWarranty,
          notes: createDto.notes,
          isActive: createDto.isActive !== undefined ? createDto.isActive : true,
        },
      });
    } else {
      // Get default values
      const defaults = this.getDefaultWarrantyConfig(createDto.warrantyType);
      
      // Create new
      return this.prisma.warrantyConfiguration.create({
        data: {
          customerBankId,
          warrantyType: createDto.warrantyType,
          warrantyPeriodDays: createDto.warrantyPeriodDays ?? defaults.warrantyPeriodDays,
          maxWarrantyClaims: createDto.unlimitedClaims ? null : (createDto.maxWarrantyClaims ?? defaults.maxWarrantyClaims),
          unlimitedClaims: createDto.unlimitedClaims ?? false,
          warrantyExtensionDays: createDto.warrantyExtensionDays ?? defaults.warrantyExtensionDays,
          requiresApproval: createDto.requiresApproval ?? defaults.requiresApproval,
          autoApproveFirstClaim: createDto.autoApproveFirstClaim ?? defaults.autoApproveFirstClaim,
          freeRepairOnWarranty: createDto.freeRepairOnWarranty ?? defaults.freeRepairOnWarranty,
          notes: createDto.notes,
          isActive: createDto.isActive !== undefined ? createDto.isActive : true,
        },
      });
    }
  }

  /**
   * Update warranty configuration
   */
  async updateWarrantyConfig(
    customerBankId: string,
    warrantyType: WarrantyType,
    updateDto: {
      warrantyPeriodDays?: number;
      maxWarrantyClaims?: number;
      warrantyExtensionDays?: number;
      requiresApproval?: boolean;
      autoApproveFirstClaim?: boolean;
      freeRepairOnWarranty?: boolean;
      notes?: string;
      isActive?: boolean;
    },
  ) {
    const existing = await this.prisma.warrantyConfiguration.findUnique({
      where: {
        customerBankId_warrantyType: {
          customerBankId,
          warrantyType,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Warranty configuration not found');
    }

    return this.prisma.warrantyConfiguration.update({
      where: { id: existing.id },
      data: updateDto,
    });
  }

  /**
   * Get warranty statistics untuk customer
   */
  async getWarrantyStatistics(customerBankId: string) {
    const repairs = await this.prisma.repairTicket.findMany({
      where: {
        cassette: {
          customerBankId,
        },
        status: 'COMPLETED',
        qcPassed: true,
        warrantyEndDate: { not: null },
      },
      select: {
        warrantyType: true,
        warrantyClaimed: true,
        warrantyClaimCount: true,
        warrantyEndDate: true,
      },
    });

    const now = new Date();
    const activeWarranties = repairs.filter(
      (r) => r.warrantyEndDate && r.warrantyEndDate >= now,
    );

    const byType = {
      MA: activeWarranties.filter((r) => r.warrantyType === 'MA').length,
      MS: activeWarranties.filter((r) => r.warrantyType === 'MS').length,
      IN_WARRANTY: activeWarranties.filter(
        (r) => r.warrantyType === 'IN_WARRANTY',
      ).length,
      OUT_WARRANTY: activeWarranties.filter(
        (r) => r.warrantyType === 'OUT_WARRANTY',
      ).length,
    };

    const totalClaims = repairs.reduce(
      (sum, r) => sum + r.warrantyClaimCount,
      0,
    );

    return {
      totalActiveWarranties: activeWarranties.length,
      byType,
      totalClaims,
      claimRate: repairs.length > 0 ? (totalClaims / repairs.length) * 100 : 0,
    };
  }
}

