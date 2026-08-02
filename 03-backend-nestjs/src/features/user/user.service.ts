import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '../../shared/exceptions/app.exception';
import { CreateAddressDto } from './dto/create-address.dto';
import { ListUsersQueryDto } from './dto/list-users.query.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppException(
        'COMMON_404',
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toProfile(user);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const updated = await this.userRepository.updateProfile(userId, dto);
    return this.toProfile(updated);
  }

  private toProfile(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  listAddresses(userId: number) {
    return this.userRepository.findAddressesByUser(userId);
  }

  createAddress(userId: number, dto: CreateAddressDto) {
    return this.userRepository.createAddress(userId, dto);
  }

  async updateAddress(
    userId: number,
    addressId: number,
    dto: UpdateAddressDto,
  ) {
    await this.assertOwnsAddress(userId, addressId);
    return this.userRepository.updateAddress(addressId, dto);
  }

  async deleteAddress(userId: number, addressId: number) {
    await this.assertOwnsAddress(userId, addressId);
    await this.userRepository.deleteAddress(addressId);
  }

  async getPublicProfile(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppException(
        'USER_001',
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: user.id, fullName: user.fullName, role: user.role };
  }

  async listUsers(query: ListUsersQueryDto) {
    const { items, total } = await this.userRepository.findMany({
      page: query.page,
      limit: query.limit,
      role: query.role,
      search: query.search,
    });
    return {
      items: items.map((u) => this.toProfile(u)),
      meta: { page: query.page, limit: query.limit, total },
    };
  }

  async updateUserStatus(id: number, dto: UpdateUserStatusDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppException(
        'USER_001',
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const updated = await this.userRepository.updateActiveStatus(
      id,
      dto.isActive,
    );
    return this.toProfile(updated);
  }

  async getWeeklySignups() {
    return this.userRepository.countWeeklySignups(8);
  }

  private async assertOwnsAddress(userId: number, addressId: number) {
    const address = await this.userRepository.findAddressById(addressId);
    if (!address) {
      throw new AppException(
        'COMMON_404',
        'Address not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (address.userId !== userId) {
      throw new AppException(
        'AUTH_003',
        'You do not own this address',
        HttpStatus.FORBIDDEN,
      );
    }
    return address;
  }
}
