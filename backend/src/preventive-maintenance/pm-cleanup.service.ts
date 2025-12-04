import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmCleanupService {
  private readonly logger = new Logger(PmCleanupService.name);
  private readonly DELETION_RETENTION_YEARS = 7; // Keep soft-deleted records for 7 years

  constructor(private prisma: PrismaService) {}

  /**
   * Cleanup soft-deleted PMs that are older than retention period
   * Runs monthly on the 1st day at 2 AM
   */
  @Cron('0 2 1 * *', {
    name: 'cleanup-soft-deleted-pms',
    timeZone: 'Asia/Jakarta',
  })
  async cleanupSoftDeletedPMs() {
    this.logger.log('Starting cleanup of soft-deleted PMs...');

    try {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - this.DELETION_RETENTION_YEARS);

      // Find PMs that were soft-deleted more than retention years ago
      const deletedPMs = await this.prisma.preventiveMaintenance.findMany({
        where: {
          deletedAt: {
            not: null,
            lt: cutoffDate,
          },
        },
        select: {
          id: true,
          pmNumber: true,
          deletedAt: true,
        },
      });

      if (deletedPMs.length === 0) {
        this.logger.log('No soft-deleted PMs found that exceed retention period.');
        return;
      }

      this.logger.log(`Found ${deletedPMs.length} PMs to permanently delete (deleted before ${cutoffDate.toISOString()})`);

      // Delete PMs and their related data (cassetteDetails will be cascade deleted)
      const deleteResult = await this.prisma.preventiveMaintenance.deleteMany({
        where: {
          id: {
            in: deletedPMs.map((pm) => pm.id),
          },
        },
      });

      this.logger.log(`Successfully permanently deleted ${deleteResult.count} PMs:`);
      deletedPMs.forEach((pm) => {
        this.logger.log(`  - ${pm.pmNumber} (deleted at: ${pm.deletedAt?.toISOString()})`);
      });
    } catch (error: any) {
      this.logger.error('Error during cleanup of soft-deleted PMs:', error);
    }
  }

  /**
   * Cleanup soft-deleted Repair Tickets that are older than retention period
   * Runs monthly on the 1st day at 3 AM (1 hour after PM cleanup)
   */
  @Cron('0 3 1 * *', {
    name: 'cleanup-soft-deleted-repair-tickets',
    timeZone: 'Asia/Jakarta',
  })
  async cleanupSoftDeletedRepairTickets() {
    this.logger.log('Starting cleanup of soft-deleted repair tickets...');

    try {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - this.DELETION_RETENTION_YEARS);

      // Find repair tickets that were soft-deleted more than retention years ago
      const deletedRepairs = await this.prisma.repairTicket.findMany({
        where: {
          deletedAt: {
            not: null,
            lt: cutoffDate,
          },
        },
        select: {
          id: true,
          cassetteId: true,
          deletedAt: true,
        },
      });

      if (deletedRepairs.length === 0) {
        this.logger.log('No soft-deleted repair tickets found that exceed retention period.');
        return;
      }

      this.logger.log(`Found ${deletedRepairs.length} repair tickets to permanently delete (deleted before ${cutoffDate.toISOString()})`);

      // Delete repair tickets permanently
      const deleteResult = await this.prisma.repairTicket.deleteMany({
        where: {
          id: {
            in: deletedRepairs.map((repair) => repair.id),
          },
        },
      });

      this.logger.log(`Successfully permanently deleted ${deleteResult.count} repair tickets:`);
      deletedRepairs.forEach((repair) => {
        this.logger.log(`  - Repair ID: ${repair.id} (deleted at: ${repair.deletedAt?.toISOString()})`);
      });
    } catch (error: any) {
      this.logger.error('Error during cleanup of soft-deleted repair tickets:', error);
    }
  }

  /**
   * Cleanup soft-deleted Problem Tickets that are older than retention period
   * Runs monthly on the 1st day at 4 AM (1 hour after repair ticket cleanup)
   */
  @Cron('0 4 1 * *', {
    name: 'cleanup-soft-deleted-problem-tickets',
    timeZone: 'Asia/Jakarta',
  })
  async cleanupSoftDeletedProblemTickets() {
    this.logger.log('Starting cleanup of soft-deleted problem tickets...');

    try {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - this.DELETION_RETENTION_YEARS);

      // Find problem tickets that were soft-deleted more than retention years ago
      const deletedTickets = await this.prisma.problemTicket.findMany({
        where: {
          deletedAt: {
            not: null,
            lt: cutoffDate,
          },
        },
        select: {
          id: true,
          ticketNumber: true,
          deletedAt: true,
        },
      });

      if (deletedTickets.length === 0) {
        this.logger.log('No soft-deleted problem tickets found that exceed retention period.');
        return;
      }

      this.logger.log(`Found ${deletedTickets.length} problem tickets to permanently delete (deleted before ${cutoffDate.toISOString()})`);

      // Delete problem tickets permanently (cassetteDetails will be cascade deleted)
      const deleteResult = await this.prisma.problemTicket.deleteMany({
        where: {
          id: {
            in: deletedTickets.map((ticket) => ticket.id),
          },
        },
      });

      this.logger.log(`Successfully permanently deleted ${deleteResult.count} problem tickets:`);
      deletedTickets.forEach((ticket) => {
        this.logger.log(`  - ${ticket.ticketNumber} (deleted at: ${ticket.deletedAt?.toISOString()})`);
      });
    } catch (error: any) {
      this.logger.error('Error during cleanup of soft-deleted problem tickets:', error);
    }
  }

  /**
   * Manual cleanup trigger for PMs (for testing or admin use)
   * @param retentionYears Optional retention period in years (default: 7)
   */
  async manualCleanup(retentionYears: number = this.DELETION_RETENTION_YEARS) {
    this.logger.log(`Manual cleanup triggered with ${retentionYears} years retention...`);

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

    const deletedPMs = await this.prisma.preventiveMaintenance.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        pmNumber: true,
        deletedAt: true,
      },
    });

    if (deletedPMs.length === 0) {
      return {
        message: 'No soft-deleted PMs found that exceed retention period.',
        deletedCount: 0,
        cutoffDate: cutoffDate.toISOString(),
      };
    }

    const deleteResult = await this.prisma.preventiveMaintenance.deleteMany({
      where: {
        id: {
          in: deletedPMs.map((pm) => pm.id),
        },
      },
    });

    return {
      message: `Successfully permanently deleted ${deleteResult.count} PMs`,
      deletedCount: deleteResult.count,
      cutoffDate: cutoffDate.toISOString(),
      deletedPMs: deletedPMs.map((pm) => ({
        pmNumber: pm.pmNumber,
        deletedAt: pm.deletedAt?.toISOString(),
      })),
    };
  }

  /**
   * Manual cleanup trigger for Repair Tickets (for testing or admin use)
   * @param retentionYears Optional retention period in years (default: 7)
   */
  async manualCleanupRepairTickets(retentionYears: number = this.DELETION_RETENTION_YEARS) {
    this.logger.log(`Manual cleanup of repair tickets triggered with ${retentionYears} years retention...`);

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

    const deletedRepairs = await this.prisma.repairTicket.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        cassetteId: true,
        deletedAt: true,
      },
    });

    if (deletedRepairs.length === 0) {
      return {
        message: 'No soft-deleted repair tickets found that exceed retention period.',
        deletedCount: 0,
        cutoffDate: cutoffDate.toISOString(),
      };
    }

    const deleteResult = await this.prisma.repairTicket.deleteMany({
      where: {
        id: {
          in: deletedRepairs.map((repair) => repair.id),
        },
      },
    });

    return {
      message: `Successfully permanently deleted ${deleteResult.count} repair tickets`,
      deletedCount: deleteResult.count,
      cutoffDate: cutoffDate.toISOString(),
      deletedRepairs: deletedRepairs.map((repair) => ({
        id: repair.id,
        deletedAt: repair.deletedAt?.toISOString(),
      })),
    };
  }

  /**
   * Manual cleanup trigger for Problem Tickets (for testing or admin use)
   * @param retentionYears Optional retention period in years (default: 7)
   */
  async manualCleanupProblemTickets(retentionYears: number = this.DELETION_RETENTION_YEARS) {
    this.logger.log(`Manual cleanup of problem tickets triggered with ${retentionYears} years retention...`);

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

    const deletedTickets = await this.prisma.problemTicket.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        ticketNumber: true,
        deletedAt: true,
      },
    });

    if (deletedTickets.length === 0) {
      return {
        message: 'No soft-deleted problem tickets found that exceed retention period.',
        deletedCount: 0,
        cutoffDate: cutoffDate.toISOString(),
      };
    }

    const deleteResult = await this.prisma.problemTicket.deleteMany({
      where: {
        id: {
          in: deletedTickets.map((ticket) => ticket.id),
        },
      },
    });

    return {
      message: `Successfully permanently deleted ${deleteResult.count} problem tickets`,
      deletedCount: deleteResult.count,
      cutoffDate: cutoffDate.toISOString(),
      deletedTickets: deletedTickets.map((ticket) => ({
        ticketNumber: ticket.ticketNumber,
        deletedAt: ticket.deletedAt?.toISOString(),
      })),
    };
  }
}

