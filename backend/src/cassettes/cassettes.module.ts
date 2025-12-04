import { Module } from '@nestjs/common';
import { CassettesController } from './cassettes.controller';
import { CassettesService } from './cassettes.service';

@Module({
  controllers: [CassettesController],
  providers: [CassettesService],
  exports: [CassettesService],
})
export class CassettesModule {}

