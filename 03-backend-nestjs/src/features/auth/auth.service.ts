import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../../core/cache/redis.service';
import { AppException } from '../../shared/exceptions/app.exception';
import { durationToSeconds } from '../../shared/utils/duration.util';
import { USER_PORT } from '../user/user.port';
import type { UserPort } from '../user/user.port';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, TokenPair } from './types/auth.types';
import { refreshTokenKey } from './utils/refresh-token-key.util';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_PORT) private readonly userPort: UserPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userPort.findByEmail(dto.email);
    if (existing) {
      throw new AppException(
        'AUTH_006',
        'Email already registered',
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.userPort.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      fullName: dto.fullName,
      role: 'buyer',
    });

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.userPort.findByEmail(dto.email);
    if (!user) {
      throw new AppException(
        'AUTH_004',
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new AppException(
        'AUTH_004',
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isActive) {
      throw new AppException(
        'AUTH_005',
        'Account is inactive or unverified',
        HttpStatus.FORBIDDEN,
      );
    }

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let userId: number;
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: number }>(
        refreshToken,
        {
          secret: this.configService.get<string>('jwt.secret'),
        },
      );
      userId = payload.sub;
    } catch {
      throw new AppException(
        'AUTH_001',
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const stored = await this.redisService.get(refreshTokenKey(userId));
    if (!stored || stored !== refreshToken) {
      throw new AppException(
        'AUTH_001',
        'Refresh token has been revoked',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userPort.findById(userId);
    if (!user) {
      throw new AppException(
        'AUTH_001',
        'User no longer exists',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async logout(userId: number): Promise<void> {
    await this.redisService.del(refreshTokenKey(userId));
  }

  private async issueTokenPair(
    userId: number,
    email: string,
    role: string,
  ): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email, role };
    const accessTtl = this.configService.get<string>('jwt.accessTtl') as string;
    const refreshTtl = this.configService.get<string>(
      'jwt.refreshTtl',
    ) as string;
    const secret = this.configService.get<string>('jwt.secret');

    const accessToken = await this.jwtService.signAsync(
      { ...payload },
      { secret, expiresIn: accessTtl as `${number}${'s' | 'm' | 'h' | 'd'}` },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      { secret, expiresIn: refreshTtl as `${number}${'s' | 'm' | 'h' | 'd'}` },
    );

    await this.redisService.set(
      refreshTokenKey(userId),
      refreshToken,
      durationToSeconds(refreshTtl),
    );

    return { accessToken, refreshToken };
  }

  private toPublicUser(user: { id: number; fullName: string; role: string }) {
    return { id: user.id, fullName: user.fullName, role: user.role };
  }
}
