import { Module } from '@nestjs/common';
import { PengelolaController } from './pengelola.controller';
import { PengelolaService } from './pengelola.service';

@Module({
  controllers: [PengelolaController],
  providers: [PengelolaService],
  exports: [PengelolaService],
})
export class PengelolaModule {}

