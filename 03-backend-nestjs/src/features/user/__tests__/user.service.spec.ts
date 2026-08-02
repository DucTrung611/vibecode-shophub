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
    findMany: jest.Mock;
    updateActiveStatus: jest.Mock;
    countWeeklySignups: jest.Mock;
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
      findMany: jest.fn(),
      updateActiveStatus: jest.fn(),
      countWeeklySignups: jest.fn(),
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

  describe('getPublicProfile', () => {
    it('throws USER_001 when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getPublicProfile(userId)).rejects.toMatchObject({
        response: { code: 'USER_001' },
      });
    });

    it('returns only public fields', async () => {
      userRepository.findById.mockResolvedValue(baseUser);

      const result = await service.getPublicProfile(userId);

      expect(result).toEqual({
        id: baseUser.id,
        fullName: baseUser.fullName,
        role: baseUser.role,
      });
      expect(result).not.toHaveProperty('email');
    });
  });

  describe('updateUserStatus', () => {
    it('throws USER_001 when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateUserStatus(999, userId, { isActive: false }),
      ).rejects.toMatchObject({ response: { code: 'USER_001' } });
    });

    it('throws USER_002 when the admin targets their own account', async () => {
      await expect(
        service.updateUserStatus(userId, userId, { isActive: false }),
      ).rejects.toMatchObject({ response: { code: 'USER_002' } });
    });

    it('locks the user account', async () => {
      userRepository.findById.mockResolvedValue(baseUser);
      userRepository.updateActiveStatus.mockResolvedValue({
        ...baseUser,
        isActive: false,
      });

      const result = await service.updateUserStatus(999, userId, {
        isActive: false,
      });

      expect(userRepository.updateActiveStatus).toHaveBeenCalledWith(
        userId,
        false,
      );
      expect(result.isActive).toBe(false);
    });
  });

  describe('listUsers', () => {
    it('returns paginated profiles', async () => {
      userRepository.findMany.mockResolvedValue({
        items: [baseUser],
        total: 1,
      });

      const result = await service.listUsers({ page: 1, limit: 20 });

      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0]).not.toHaveProperty('passwordHash');
    });
  });
});
