import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', default: Role.Customer })
  role!: Role;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
