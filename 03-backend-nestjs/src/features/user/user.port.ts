import { CreateUserData } from './user.repository';
import { AddressEntity } from './entities/address.entity';
import { UserEntity } from './entities/user.entity';

export const USER_PORT = Symbol('USER_PORT');

export interface UserPort {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
  updateRole(
    id: number,
    role: 'buyer' | 'seller' | 'admin',
  ): Promise<UserEntity>;
  findAddressByIdForUser(
    userId: number,
    addressId: number,
  ): Promise<AddressEntity | null>;
}
