import { Role } from './enums';

export class AuthUser {
  id!: number;
  email!: string;
  role!: Role;
}
