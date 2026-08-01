import { CreateUserData } from './user.repository';
import { UserEntity } from './entities/user.entity';

export const USER_PORT = Symbol('USER_PORT');

export interface UserPort {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
}
