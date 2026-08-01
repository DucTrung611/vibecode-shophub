import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../../../core/cache/redis.service';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userPort: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let redisService: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let configService: { get: jest.Mock };

  const baseUser = {
    id: 1,
    email: 'buyer@example.com',
    phone: null,
    passwordHash: '',
    fullName: 'Nguyen Van A',
    role: 'buyer' as const,
    isActive: true,
    emailVerifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userPort = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
      verifyAsync: jest.fn(),
    };
    redisService = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'jwt.secret': 'test-secret',
          'jwt.accessTtl': '15m',
          'jwt.refreshTtl': '7d',
        };
        return values[key];
      }),
    };

    service = new AuthService(
      userPort,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      redisService as unknown as RedisService,
    );
  });

  describe('register', () => {
    it('should throw AUTH_006 when email already registered', async () => {
      userPort.findByEmail.mockResolvedValue(baseUser);

      await expect(
        service.register({
          email: baseUser.email,
          password: 'password123',
          fullName: 'A',
        }),
      ).rejects.toMatchObject({ response: { code: 'AUTH_006' } });
    });

    it('should create a buyer user and return a token pair', async () => {
      userPort.findByEmail.mockResolvedValue(null);
      userPort.create.mockResolvedValue({
        ...baseUser,
        passwordHash: 'hashed',
      });

      const result = await service.register({
        email: baseUser.email,
        password: 'password123',
        fullName: baseUser.fullName,
      });

      expect(userPort.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: baseUser.email, role: 'buyer' }),
      );
      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
      expect(redisService.set).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw AUTH_004 when user does not exist', async () => {
      userPort.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toMatchObject({ response: { code: 'AUTH_004' } });
    });

    it('should throw AUTH_004 when password does not match', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      userPort.findByEmail.mockResolvedValue({ ...baseUser, passwordHash });

      await expect(
        service.login({ email: baseUser.email, password: 'wrong-password' }),
      ).rejects.toMatchObject({ response: { code: 'AUTH_004' } });
    });

    it('should throw AUTH_005 when account is inactive', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      userPort.findByEmail.mockResolvedValue({
        ...baseUser,
        passwordHash,
        isActive: false,
      });

      await expect(
        service.login({ email: baseUser.email, password: 'correct-password' }),
      ).rejects.toMatchObject({ response: { code: 'AUTH_005' } });
    });

    it('should return a token pair on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      userPort.findByEmail.mockResolvedValue({ ...baseUser, passwordHash });

      const result = await service.login({
        email: baseUser.email,
        password: 'correct-password',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(redisService.set).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should throw AUTH_001 when the token fails verification', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.refresh('bad-token')).rejects.toMatchObject({
        response: { code: 'AUTH_001' },
      });
    });

    it('should throw AUTH_001 when stored token does not match (revoked/rotated)', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: baseUser.id });
      redisService.get.mockResolvedValue('a-different-token');

      await expect(service.refresh('presented-token')).rejects.toMatchObject({
        response: { code: 'AUTH_001' },
      });
    });

    it('should rotate the pair when the refresh token is valid and current', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: baseUser.id });
      redisService.get.mockResolvedValue('presented-token');
      userPort.findById.mockResolvedValue(baseUser);

      const result = await service.refresh('presented-token');

      expect(result.accessToken).toBe('signed-token');
      expect(redisService.set).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should delete the stored refresh token for the user', async () => {
      await service.logout(baseUser.id);
      expect(redisService.del).toHaveBeenCalledWith(
        `refresh:user:${baseUser.id}`,
      );
    });
  });
});
