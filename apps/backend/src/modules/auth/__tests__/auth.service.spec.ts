import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../core/redis/redis.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  employee: {
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      isActive: true,
      employee: {
        id: 'emp-1',
        tenantId: 'tenant-1',
        firstName: 'John',
        lastName: 'Doe',
        role: {
          permissions: [{ permission: { code: 'employee:read' } }],
        },
      },
    };

    it('should return JWT pair on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
      mockPrisma.user.update.mockResolvedValue({});
      mockConfigService.get.mockImplementation((key: string, defaultVal?: string) => {
        if (key === 'jwt.secret') return 'test-secret';
        if (key === 'jwt.expiresIn') return '15m';
        if (key === 'jwtRefresh.secret') return 'test-refresh-secret';
        if (key === 'jwtRefresh.expiresIn') return '7d';
        return defaultVal;
      });

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should include user permissions in JWT payload', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
      mockPrisma.user.update.mockResolvedValue({});
      mockConfigService.get.mockImplementation((key: string, defaultVal?: string) => {
        if (key === 'jwt.secret') return 'test-secret';
        if (key === 'jwt.expiresIn') return '15m';
        if (key === 'jwtRefresh.secret') return 'test-refresh-secret';
        if (key === 'jwtRefresh.expiresIn') return '7d';
        return defaultVal;
      });

      await service.login(loginDto);

      const payload = mockJwtService.signAsync.mock.calls[0][0];
      expect(payload.permissions).toContain('employee:read');
      expect(payload.tenantId).toBe('tenant-1');
      expect(payload.employeeId).toBe('emp-1');
    });

    it('should store hashed refresh token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
      mockPrisma.user.update.mockResolvedValue({});
      mockConfigService.get.mockImplementation((key: string, defaultVal?: string) => {
        if (key === 'jwt.secret') return 'test-secret';
        if (key === 'jwt.expiresIn') return '15m';
        if (key === 'jwtRefresh.secret') return 'test-refresh-secret';
        if (key === 'jwtRefresh.expiresIn') return '7d';
        return defaultVal;
      });

      await service.login(loginDto);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ refreshToken: 'hashed-refresh' }),
        }),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should return new token pair with valid refresh token', async () => {
      const payload = { sub: 'user-1', email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(payload);
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({
          id: 'user-1',
          email: 'test@example.com',
          refreshToken: 'hashed-rt',
        })
        .mockResolvedValueOnce({ tenantId: 'tenant-1', role: null });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-rt');
      mockPrisma.user.update.mockResolvedValue({});
      mockConfigService.get.mockImplementation((key: string, defaultVal?: string) => {
        if (key === 'jwt.secret') return 'test-secret';
        if (key === 'jwt.expiresIn') return '15m';
        if (key === 'jwtRefresh.secret') return 'test-refresh-secret';
        if (key === 'jwtRefresh.expiresIn') return '7d';
        return defaultVal;
      });

      const result = await service.refreshTokens('old-refresh-token');

      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refreshTokens('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if user not found', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if stored refresh token does not match', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        refreshToken: 'stored-hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshTokens('token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.logout('user-1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { refreshToken: null },
      });
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('getMe', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        isActive: true,
        lastLoginAt: new Date(),
        employee: {
          id: 'emp-1',
          firstName: 'John',
          lastName: 'Doe',
          department: { name: 'Engineering' },
          role: { name: 'Admin', permissions: [] },
          shift: { name: 'Morning' },
        },
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(result.employee).toBeDefined();
    });

    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('nonexistent')).rejects.toThrow(UnauthorizedException);
    });
  });
});
