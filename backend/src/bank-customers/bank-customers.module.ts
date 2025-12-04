import { Module } from '@nestjs/common';
import { BankCustomersController } from './bank-customers.controller';
import { BankCustomersService } from './bank-customers.service';

@Module({
  controllers: [BankCustomersController],
  providers: [BankCustomersService],
  exports: [BankCustomersService],
})
export class BankCustomersModule {}

