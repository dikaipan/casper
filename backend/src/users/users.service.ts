import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getEngineers() {
    return this.prisma.hitachiUser.findMany({
      where: {
        status: 'ACTIVE',
        role: {
          in: ['RC_STAFF', 'RC_MANAGER'],
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
  }
}

