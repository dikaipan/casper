import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHitachiUserDto } from './dto/create-hitachi-user.dto';
import { UpdateHitachiUserDto } from './dto/update-hitachi-user.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // Try to find in hitachi_users
    const hitachiUser = await this.prisma.hitachiUser.findUnique({
      where: { username },
    });

    if (hitachiUser) {
      const isPasswordValid = await bcrypt.compare(password, hitachiUser.passwordHash);
      if (isPasswordValid && hitachiUser.status === 'ACTIVE') {
        const { passwordHash, ...result } = hitachiUser;
        return {
          ...result,
          userType: 'HITACHI',
        };
      }
    }

    // Try to find in pengelola_users
    const pengelolaUser = await this.prisma.pengelolaUser.findUnique({
      where: { username },
      include: { pengelola: true },
    });

    if (pengelolaUser) {
      const isPasswordValid = await bcrypt.compare(password, pengelolaUser.passwordHash);
      if (isPasswordValid && pengelolaUser.status === 'ACTIVE') {
        const { passwordHash, ...result } = pengelolaUser;
        return {
          ...result,
          userType: 'PENGELOLA',
          pengelolaId: pengelolaUser.pengelolaId,
        };
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      userType: user.userType,
      pengelolaId: user.pengelolaId,
      department: user.department,
    };

    // Generate access token (short-lived: 15 minutes)
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token (long-lived: 7 days)
    const refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 
                               this.configService.get<string>('JWT_SECRET') + '_refresh';
    const refreshTokenExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    
    // Generate secure random refresh token
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        userType: user.userType,
        expiresAt,
      },
    });

    // Revoke old refresh tokens for this user (keep only the latest 5)
    const oldTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        userType: user.userType,
        revoked: false,
      },
      orderBy: { createdAt: 'desc' },
      skip: 4, // Keep latest 5 (including the one we just created)
    });

    if (oldTokens.length > 0) {
      await this.prisma.refreshToken.updateMany({
        where: {
          id: { in: oldTokens.map(t => t.id) },
        },
        data: {
          revoked: true,
          revokedAt: new Date(),
        },
      });
    }

    // Update last login
    if (user.userType === 'HITACHI') {
      await this.prisma.hitachiUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } else {
      await this.prisma.pengelolaUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    }

    return {
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        userType: user.userType,
        pengelolaId: user.pengelolaId,
        department: user.department,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    // Find refresh token in database
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is revoked
    if (tokenRecord.revoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      // Mark as revoked
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          revoked: true,
          revokedAt: new Date(),
        },
      });
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Get user data
    let user: any;
    if (tokenRecord.userType === 'HITACHI') {
      user = await this.prisma.hitachiUser.findUnique({
        where: { id: tokenRecord.userId },
      });
    } else {
      user = await this.prisma.pengelolaUser.findUnique({
        where: { id: tokenRecord.userId },
        include: { pengelola: true },
      });
    }

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new access token
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      userType: tokenRecord.userType,
      pengelolaId: tokenRecord.userType === 'PENGELOLA' ? user.pengelolaId : undefined,
      department: tokenRecord.userType === 'HITACHI' ? user.department : undefined,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
    };
  }

  async logout(refreshToken: string) {
    // Revoke refresh token
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (tokenRecord && !tokenRecord.revoked) {
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          revoked: true,
          revokedAt: new Date(),
        },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async revokeAllUserTokens(userId: string, userType: string) {
    // Revoke all refresh tokens for a user (useful for password change, etc.)
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        userType,
        revoked: false,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  async getProfile(userId: string, userType: string) {
    if (userType === 'HITACHI') {
      const user = await this.prisma.hitachiUser.findUnique({
        where: { id: userId },
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
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return { ...user, userType: 'HITACHI' };
    } else {
      const user = await this.prisma.pengelolaUser.findUnique({
        where: { id: userId },
        include: {
          pengelola: {
            select: {
              id: true,
              pengelolaCode: true,
              companyName: true,
              companyAbbreviation: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { passwordHash, ...userWithoutPassword } = user;
      return { ...userWithoutPassword, userType: 'PENGELOLA' };
    }
  }

  async createHitachiUser(createUserDto: CreateHitachiUserDto) {
    // Check if username or email already exists
    const existingUser = await this.prisma.hitachiUser.findFirst({
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

    return this.prisma.hitachiUser.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash,
        fullName: createUserDto.fullName,
        role: createUserDto.role,
        department: createUserDto.department,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async getAllHitachiUsers() {
    return this.prisma.hitachiUser.findMany({
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
        createdAt: 'desc',
      },
    });
  }

  async updateHitachiUser(userId: string, updateUserDto: UpdateHitachiUserDto) {
    const user = await this.prisma.hitachiUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if username or email already exists (excluding current user)
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.prisma.hitachiUser.findFirst({
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

    return this.prisma.hitachiUser.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async deleteHitachiUser(userId: string) {
    const user = await this.prisma.hitachiUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.hitachiUser.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }
}

