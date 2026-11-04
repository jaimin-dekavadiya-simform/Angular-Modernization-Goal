import { createHash, randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppConfig } from '../config/configuration';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('Email is already registered');
    }
    const user = await this.users.create({
      email: dto.email,
      name: dto.name,
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    return this.issueSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueSession(user);
  }

  async refresh(refreshToken: string) {
    let sub: number;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number }>(
        refreshToken,
        {
          secret: this.config.get('jwt', { infer: true }).refreshSecret,
        },
      );
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findById(sub);
    if (
      !user?.refreshTokenHash ||
      user.refreshTokenHash !== sha256(refreshToken)
    ) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    return this.issueSession(user);
  }

  async logout(userId: number) {
    await this.users.setRefreshTokenHash(userId, null);
  }

  async me(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  private async issueSession(user: User) {
    const jwtConfig = this.config.get('jwt', { infer: true });
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      { secret: jwtConfig.accessSecret, expiresIn: jwtConfig.accessTtl },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: randomUUID() },
      { secret: jwtConfig.refreshSecret, expiresIn: jwtConfig.refreshTtl },
    );
    await this.users.setRefreshTokenHash(user.id, sha256(refreshToken));
    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.accessTtl,
      user: this.publicUser(user),
    };
  }

  private publicUser(user: User) {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
