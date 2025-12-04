import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { PreventiveMaintenanceService } from './preventive-maintenance.service';
import { PreventiveMaintenanceController } from './preventive-maintenance.controller';
import { PmSchedulerService } from './pm-scheduler.service';
import { PmCleanupService } from './pm-cleanup.service';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PreventiveMaintenanceController],
  providers: [PreventiveMaintenanceService, PmSchedulerService, PmCleanupService],
  exports: [PreventiveMaintenanceService, PmSchedulerService, PmCleanupService],
})
export class PreventiveMaintenanceModule {}

