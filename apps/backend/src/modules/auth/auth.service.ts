import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';
import { RedisService } from '../../core/redis/redis.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        employee: {
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const permissions =
      user.employee?.role?.permissions?.map(
        (rp: { permission: { code: string } }) => rp.permission.code,
      ) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.employee?.tenantId,
      employeeId: user.employee?.id,
      permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwtRefresh.secret'),
        expiresIn: this.configService.get<string>('jwtRefresh.expiresIn', '7d'),
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash, lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        employee: user.employee
          ? {
              id: user.employee.id,
              firstName: user.employee.firstName,
              lastName: user.employee.lastName,
            }
          : null,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwtRefresh.secret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access denied');
      }

      const rtMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!rtMatch) {
        throw new UnauthorizedException('Access denied');
      }

      const employee = await this.prisma.employee.findUnique({
        where: { userId: user.id },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      });

      const permissions =
        employee?.role?.permissions?.map(
          (rp: { permission: { code: string } }) => rp.permission.code,
        ) || [];

      const newPayload = {
        sub: user.id,
        email: user.email,
        tenantId: employee?.tenantId,
        employeeId: employee?.id,
        permissions,
      };

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.jwtService.signAsync(newPayload, {
          secret: this.configService.get<string>('jwt.secret'),
          expiresIn: this.configService.get<string>('jwt.expiresIn', '15m'),
        }),
        this.jwtService.signAsync(newPayload, {
          secret: this.configService.get<string>('jwtRefresh.secret'),
          expiresIn: this.configService.get<string>('jwtRefresh.expiresIn', '7d'),
        }),
      ]);

      const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: refreshTokenHash },
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Access denied');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            department: true,
            role: { include: { permissions: { include: { permission: true } } } },
            shift: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      employee: user.employee,
    };
  }
}
