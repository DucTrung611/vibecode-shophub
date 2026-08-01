import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UserEntity } from './entities/user.entity';

export interface CreateUserData {
  email: string;
  phone?: string;
  passwordHash: string;
  fullName: string;
  role: 'buyer' | 'seller' | 'admin';
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserData): Promise<UserEntity> {
    return this.prisma.user.create({ data });
  }

  updateRole(
    id: number,
    role: 'buyer' | 'seller' | 'admin',
  ): Promise<UserEntity> {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }
}
