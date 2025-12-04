import { Controller, Post, Get, Body, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateHitachiUserDto } from './dto/create-hitachi-user.dto';
import { UpdateHitachiUserDto } from './dto/update-hitachi-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, AllowUserTypes } from '../common/decorators/roles.decorator';
import { UserType } from '../common/decorators/roles.decorator';
import { SecurityLoggerService } from '../common/services/security-logger.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private securityLogger: SecurityLoggerService,
  ) {}

  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Security: 5 login attempts per minute
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'admin' },
        password: { type: 'string', example: 'admin123' },
      },
    },
  })
  async login(@Request() req) {
    // Security: Log login attempts
    this.securityLogger.logLoginAttempt(
      req.user?.username || 'unknown',
      req.ip || 'unknown',
      'SUCCESS',
    );
    return this.authService.login(req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id, req.user.userType);
  }

  @Post('hitachi-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new Hitachi user (Super Admin only)' })
  async createHitachiUser(@Body() createUserDto: CreateHitachiUserDto) {
    return this.authService.createHitachiUser(createUserDto);
  }

  @Get('hitachi-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN', 'RC_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all Hitachi users' })
  async getAllHitachiUsers() {
    return this.authService.getAllHitachiUsers();
  }

  @Patch('hitachi-users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Hitachi user (Super Admin only)' })
  async updateHitachiUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateHitachiUserDto,
  ) {
    return this.authService.updateHitachiUser(id, updateUserDto);
  }

  @Delete('hitachi-users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Hitachi user (Super Admin only)' })
  async deleteHitachiUser(@Param('id') id: string) {
    return this.authService.deleteHitachiUser(id);
  }

  @Post('refresh')
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 refresh attempts per minute
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string', example: 'a1b2c3d4e5f6...' },
      },
      required: ['refresh_token'],
    },
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string', example: 'a1b2c3d4e5f6...' },
      },
      required: ['refresh_token'],
    },
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refresh_token);
  }
}

