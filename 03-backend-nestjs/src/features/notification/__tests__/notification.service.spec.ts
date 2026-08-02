import { EventsGateway } from '../../../core/events/ws.gateway';
import { NotificationRepository } from '../notification.repository';
import { NotificationService } from '../notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: {
    findByUser: jest.Mock;
    findById: jest.Mock;
    markRead: jest.Mock;
    markAllRead: jest.Mock;
    create: jest.Mock;
  };
  let eventsGateway: { emitToUser: jest.Mock; emitToShop: jest.Mock };

  const userId = 1;
  const otherUserId = 2;

  beforeEach(() => {
    notificationRepository = {
      findByUser: jest.fn(),
      findById: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn(),
      create: jest.fn(),
    };
    eventsGateway = { emitToUser: jest.fn(), emitToShop: jest.fn() };

    service = new NotificationService(
      notificationRepository as unknown as NotificationRepository,
      eventsGateway as unknown as EventsGateway,
    );
  });

  describe('list', () => {
    it('returns a paginated shape', async () => {
      notificationRepository.findByUser.mockResolvedValue({
        items: [{ id: 1 }],
        total: 1,
      });

      const result = await service.list(userId, 1, 20);

      expect(result).toEqual({
        items: [{ id: 1 }],
        meta: { page: 1, limit: 20, total: 1 },
      });
    });
  });

  describe('markRead', () => {
    it('throws COMMON_404 when the notification does not exist', async () => {
      notificationRepository.findById.mockResolvedValue(null);

      await expect(service.markRead(userId, 1)).rejects.toMatchObject({
        response: { code: 'COMMON_404' },
      });
    });

    it('throws AUTH_003 when the notification belongs to another user', async () => {
      notificationRepository.findById.mockResolvedValue({
        id: 1,
        userId: otherUserId,
      });

      await expect(service.markRead(userId, 1)).rejects.toMatchObject({
        response: { code: 'AUTH_003' },
      });
    });

    it('marks the notification read when owned by the caller', async () => {
      notificationRepository.findById.mockResolvedValue({ id: 1, userId });

      await service.markRead(userId, 1);

      expect(notificationRepository.markRead).toHaveBeenCalledWith(1);
    });
  });
});
