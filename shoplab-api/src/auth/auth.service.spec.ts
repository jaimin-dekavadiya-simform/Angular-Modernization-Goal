import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let store: Map<string, User>;
  let nextId: number;

  beforeEach(() => {
    store = new Map();
    nextId = 1;
    const users = {
      findByEmail: async (email: string) =>
        store.get(email.toLowerCase()) ?? null,
      findById: async (id: number) =>
        [...store.values()].find((u) => u.id === id) ?? null,
      create: async (data: Partial<User>) => {
        const user = {
          id: nextId++,
          role: Role.Customer,
          refreshTokenHash: null,
          ...data,
          email: data.email!.toLowerCase(), // mirrors UsersService.create
        } as User;
        store.set(user.email, user);
        return user;
      },
      setRefreshTokenHash: async (id: number, hash: string | null) => {
        const user = [...store.values()].find((u) => u.id === id);
        if (user) user.refreshTokenHash = hash;
      },
    } as unknown as UsersService;
    const config = {
      get: () => ({
        accessSecret: 'a',
        refreshSecret: 'r',
        accessTtl: 60,
        refreshTtl: 600,
      }),
    } as unknown as ConfigService<never, true>;
    service = new AuthService(users, new JwtService(), config);
  });

  it('registers a user, hashing the password', async () => {
    const session = await service.register({
      email: 'A@x.io',
      password: 'password1',
      name: 'Ann',
    });
    expect(session.user).toEqual({
      id: 1,
      email: 'a@x.io',
      name: 'Ann',
      role: Role.Customer,
    });
    const stored = store.get('a@x.io')!;
    expect(stored.passwordHash).not.toBe('password1');
    expect(await bcrypt.compare('password1', stored.passwordHash)).toBe(true);
  });

  it('rejects duplicate emails', async () => {
    await service.register({
      email: 'a@x.io',
      password: 'password1',
      name: 'Ann',
    });
    await expect(
      service.register({ email: 'a@x.io', password: 'password2', name: 'Ann' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a wrong password', async () => {
    await service.register({
      email: 'a@x.io',
      password: 'password1',
      name: 'Ann',
    });
    await expect(
      service.login({ email: 'a@x.io', password: 'nope' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates refresh tokens: the old one stops working', async () => {
    const first = await service.register({
      email: 'a@x.io',
      password: 'password1',
      name: 'Ann',
    });
    const second = await service.refresh(first.refreshToken);
    expect(second.refreshToken).not.toBe(first.refreshToken);
    await expect(service.refresh(first.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('revokes the refresh token on logout', async () => {
    const session = await service.register({
      email: 'a@x.io',
      password: 'password1',
      name: 'Ann',
    });
    await service.logout(session.user.id);
    await expect(service.refresh(session.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
