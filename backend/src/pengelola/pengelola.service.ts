import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePengelolaDto, UpdatePengelolaDto, CreatePengelolaUserDto, UpdatePengelolaUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PengelolaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pengelola.findMany({
      include: {
        bankAssignments: {
          include: {
            customerBank: {
              select: {
                id: true,
                bankCode: true,
                bankName: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
            machines: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const pengelola = await this.prisma.pengelola.findUnique({
      where: { id },
      include: {
        bankAssignments: {
          include: {
            customerBank: true,
          },
        },
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            role: true,
            status: true,
            assignedBranches: true,
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
      },
    });

    if (!pengelola) {
      throw new NotFoundException(`Pengelola with ID ${id} not found`);
    }

    return pengelola;
  }

  async create(createPengelolaDto: CreatePengelolaDto) {
    const existingPengelola = await this.prisma.pengelola.findUnique({
      where: { pengelolaCode: createPengelolaDto.pengelolaCode },
    });

    if (existingPengelola) {
      throw new ConflictException(
        `Pengelola with code ${createPengelolaDto.pengelolaCode} already exists`,
      );
    }

    return this.prisma.pengelola.create({
      data: createPengelolaDto,
    });
  }

  async update(id: string, updatePengelolaDto: UpdatePengelolaDto) {
    const pengelola = await this.findOne(id);

    if (updatePengelolaDto.pengelolaCode && updatePengelolaDto.pengelolaCode !== pengelola.pengelolaCode) {
      const existingPengelola = await this.prisma.pengelola.findUnique({
        where: { pengelolaCode: updatePengelolaDto.pengelolaCode },
      });

      if (existingPengelola) {
        throw new ConflictException(
          `Pengelola with code ${updatePengelolaDto.pengelolaCode} already exists`,
        );
      }
    }

    return this.prisma.pengelola.update({
      where: { id },
      data: updatePengelolaDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const machineCount = await this.prisma.machine.count({
      where: { pengelolaId: id },
    });

    if (machineCount > 0) {
      throw new ConflictException(
        `Cannot delete pengelola with ${machineCount} associated machines`,
      );
    }

    return this.prisma.pengelola.delete({
      where: { id },
    });
  }

  // Pengelola Users Management
  async createUser(pengelolaId: string, createUserDto: CreatePengelolaUserDto, currentUserId: string, currentUserType: string) {
    const pengelola = await this.findOne(pengelolaId);

    // Check if username or email already exists
    const existingUser = await this.prisma.pengelolaUser.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.pengelolaUser.create({
      data: {
        pengelolaId,
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash,
        fullName: createUserDto.fullName,
        phone: createUserDto.phone,
        whatsappNumber: createUserDto.whatsappNumber,
        role: createUserDto.role,
        employeeId: createUserDto.employeeId,
        canCreateTickets: createUserDto.canCreateTickets ?? true,
        canCloseTickets: createUserDto.canCloseTickets ?? false,
        canManageMachines: createUserDto.canManageMachines ?? false,
        assignedBranches: createUserDto.assignedBranches,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        assignedBranches: true,
        createdAt: true,
      },
    });
  }

  async getPengelolaUsers(pengelolaId: string) {
    await this.findOne(pengelolaId);

    return this.prisma.pengelolaUser.findMany({
      where: { pengelolaId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        whatsappNumber: true,
        role: true,
        employeeId: true,
        canCreateTickets: true,
        canCloseTickets: true,
        canManageMachines: true,
        assignedBranches: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPengelolaMachines(pengelolaId: string, currentUserId: string, userType: string) {
    await this.findOne(pengelolaId);

    // If pengelola user, get their assigned branches
    let assignedBranches: string[] | null = null;
    if (userType === 'PENGELOLA') {
      const pengelolaUser = await this.prisma.pengelolaUser.findUnique({
        where: { id: currentUserId },
        select: { assignedBranches: true, role: true },
      });

      if (pengelolaUser && pengelolaUser.role === 'TECHNICIAN') {
        assignedBranches = pengelolaUser.assignedBranches as string[];
      }
    }

    const whereClause: any = { pengelolaId };

    // Filter by assigned branches if technician
    if (assignedBranches && assignedBranches.length > 0) {
      whereClause.branchCode = { in: assignedBranches };
    }

    return this.prisma.machine.findMany({
      where: whereClause,
      include: {
        customerBank: {
          select: {
            bankCode: true,
            bankName: true,
          },
        },
      },
      orderBy: { branchCode: 'asc' },
    });
  }

  async updatePengelolaUser(
    pengelolaId: string,
    userId: string,
    updateUserDto: UpdatePengelolaUserDto,
    currentUserId: string,
    currentUserType: string,
  ) {
    await this.findOne(pengelolaId);

    const user = await this.prisma.pengelolaUser.findUnique({
      where: { id: userId },
    });

    if (!user || user.pengelolaId !== pengelolaId) {
      throw new NotFoundException('User not found');
    }

    // Check if username or email already exists (excluding current user)
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.prisma.pengelolaUser.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                updateUserDto.username ? { username: updateUserDto.username } : {},
                updateUserDto.email ? { email: updateUserDto.email } : {},
              ],
            },
          ],
        },
      });

      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }
    }

    const updateData: any = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password;
    }

    return this.prisma.pengelolaUser.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        whatsappNumber: true,
        role: true,
        employeeId: true,
        canCreateTickets: true,
        canCloseTickets: true,
        canManageMachines: true,
        assignedBranches: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async deletePengelolaUser(
    pengelolaId: string,
    userId: string,
    currentUserId: string,
    currentUserType: string,
  ) {
    await this.findOne(pengelolaId);

    const user = await this.prisma.pengelolaUser.findUnique({
      where: { id: userId },
    });

    if (!user || user.pengelolaId !== pengelolaId) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.pengelolaUser.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }
}

