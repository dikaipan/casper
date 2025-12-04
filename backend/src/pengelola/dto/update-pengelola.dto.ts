import { PartialType } from '@nestjs/swagger';
import { CreatePengelolaDto } from './create-pengelola.dto';

export class UpdatePengelolaDto extends PartialType(CreatePengelolaDto) {}

