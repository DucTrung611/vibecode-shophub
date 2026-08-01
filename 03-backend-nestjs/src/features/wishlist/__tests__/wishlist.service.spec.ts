import { WishlistRepository } from '../wishlist.repository';
import { WishlistService } from '../wishlist.service';

describe('WishlistService', () => {
  let service: WishlistService;
  let wishlistRepository: {
    findByUser: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };

  const userId = 1;

  beforeEach(() => {
    wishlistRepository = {
      findByUser: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    service = new WishlistService(
      wishlistRepository as unknown as WishlistRepository,
    );
  });

  describe('list', () => {
    it('delegates to the repository', async () => {
      wishlistRepository.findByUser.mockResolvedValue([{ id: 1 }]);

      const result = await service.list(userId);

      expect(result).toEqual([{ id: 1 }]);
      expect(wishlistRepository.findByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('add', () => {
    it('returns the existing entry when already saved', async () => {
      wishlistRepository.findOne.mockResolvedValue({ id: 1 });

      const result = await service.add(userId, 10);

      expect(result).toEqual({ id: 1 });
      expect(wishlistRepository.create).not.toHaveBeenCalled();
    });

    it('creates a new entry when not already saved', async () => {
      wishlistRepository.findOne.mockResolvedValue(null);
      wishlistRepository.create.mockResolvedValue({ id: 2 });

      const result = await service.add(userId, 10);

      expect(wishlistRepository.create).toHaveBeenCalledWith(userId, 10);
      expect(result).toEqual({ id: 2 });
    });
  });

  describe('remove', () => {
    it('throws COMMON_404 when the product is not in the wishlist', async () => {
      wishlistRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId, 10)).rejects.toMatchObject({
        response: { code: 'COMMON_404' },
      });
    });

    it('deletes the entry when it exists', async () => {
      wishlistRepository.findOne.mockResolvedValue({ id: 1 });

      await service.remove(userId, 10);

      expect(wishlistRepository.delete).toHaveBeenCalledWith(userId, 10);
    });
  });
});
