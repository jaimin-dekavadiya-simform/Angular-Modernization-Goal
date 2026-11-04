import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: number) {
    return this.users.findOne({ where: { id } });
  }

  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: Role;
  }) {
    return this.users.save(
      this.users.create({
        ...data,
        email: data.email.toLowerCase(),
        role: data.role ?? Role.Customer,
        refreshTokenHash: null,
      }),
    );
  }

  setRefreshTokenHash(id: number, hash: string | null) {
    return this.users.update(id, { refreshTokenHash: hash });
  }
}
