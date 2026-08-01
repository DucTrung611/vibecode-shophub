import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: {
    findById: jest.Mock;
    updateProfile: jest.Mock;
    findAddressesByUser: jest.Mock;
    findAddressById: jest.Mock;
    createAddress: jest.Mock;
    updateAddress: jest.Mock;
    deleteAddress: jest.Mock;
  };

  const userId = 1;
  const otherUserId = 2;
  const baseUser = {
    id: userId,
    email: 'buyer@example.com',
    phone: '0900000000',
    passwordHash: 'hash',
    fullName: 'Buyer Test',
    role: 'buyer' as const,
    isActive: true,
    emailVerifiedAt: null,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      updateProfile: jest.fn(),
      findAddressesByUser: jest.fn(),
      findAddressById: jest.fn(),
      createAddress: jest.fn(),
      updateAddress: jest.fn(),
      deleteAddress: jest.fn(),
    };

    service = new UserService(userRepository as unknown as UserRepository);
  });

  describe('getProfile', () => {
    it('throws COMMON_404 when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toMatchObject({
        response: { code: 'COMMON_404' },
      });
    });

    it('returns the profile without the password hash', async () => {
      userRepository.findById.mockResolvedValue(baseUser);

      const result = await service.getProfile(userId);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toEqual({
        id: baseUser.id,
        email: baseUser.email,
        phone: baseUser.phone,
        fullName: baseUser.fullName,
        role: baseUser.role,
        isActive: baseUser.isActive,
        createdAt: baseUser.createdAt,
      });
    });
  });

  describe('updateProfile', () => {
    it('updates and returns the profile without the password hash', async () => {
      userRepository.updateProfile.mockResolvedValue({
        ...baseUser,
        fullName: 'New Name',
      });

      const result = await service.updateProfile(userId, {
        fullName: 'New Name',
      });

      expect(userRepository.updateProfile).toHaveBeenCalledWith(userId, {
        fullName: 'New Name',
      });
      expect(result.fullName).toBe('New Name');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('updateAddress', () => {
    it('throws COMMON_404 when the address does not exist', async () => {
      userRepository.findAddressById.mockResolvedValue(null);

      await expect(
        service.updateAddress(userId, 1, { recipientName: 'A' }),
      ).rejects.toMatchObject({ response: { code: 'COMMON_404' } });
    });

    it('throws AUTH_003 when the address belongs to another user', async () => {
      userRepository.findAddressById.mockResolvedValue({
        id: 1,
        userId: otherUserId,
      });

      await expect(
        service.updateAddress(userId, 1, { recipientName: 'A' }),
      ).rejects.toMatchObject({ response: { code: 'AUTH_003' } });
    });

    it('updates the address when owned by the caller', async () => {
      userRepository.findAddressById.mockResolvedValue({ id: 1, userId });
      userRepository.updateAddress.mockResolvedValue({
        id: 1,
        recipientName: 'A',
      });

      const result = await service.updateAddress(userId, 1, {
        recipientName: 'A',
      });

      expect(userRepository.updateAddress).toHaveBeenCalledWith(1, {
        recipientName: 'A',
      });
      expect(result).toEqual({ id: 1, recipientName: 'A' });
    });
  });

  describe('deleteAddress', () => {
    it('throws AUTH_003 when the address belongs to another user', async () => {
      userRepository.findAddressById.mockResolvedValue({
        id: 1,
        userId: otherUserId,
      });

      await expect(service.deleteAddress(userId, 1)).rejects.toMatchObject({
        response: { code: 'AUTH_003' },
      });
    });

    it('deletes the address when owned by the caller', async () => {
      userRepository.findAddressById.mockResolvedValue({ id: 1, userId });

      await service.deleteAddress(userId, 1);

      expect(userRepository.deleteAddress).toHaveBeenCalledWith(1);
    });
  });
});
