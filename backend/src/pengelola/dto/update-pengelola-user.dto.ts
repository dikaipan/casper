import { PartialType } from '@nestjs/swagger';
import { CreatePengelolaUserDto } from './create-pengelola-user.dto';

export class UpdatePengelolaUserDto extends PartialType(CreatePengelolaUserDto) {}

