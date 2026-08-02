import { HttpStatus, Injectable } from '@nestjs/common';
import { EventsGateway } from '../../core/events/ws.gateway';
import { AppException } from '../../shared/exceptions/app.exception';
import {
  CreateNotificationData,
  NotificationRepository,
} from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async list(userId: number, page: number, limit: number) {
    const { items, total } = await this.notificationRepository.findByUser(
      userId,
      page,
      limit,
    );
    return { items, meta: { page, limit, total } };
  }

  async markRead(userId: number, id: number) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new AppException(
        'COMMON_404',
        'Notification not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (notification.userId !== userId) {
      throw new AppException(
        'AUTH_003',
        'You do not own this notification',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.notificationRepository.markRead(id);
  }

  async markAllRead(userId: number) {
    await this.notificationRepository.markAllRead(userId);
  }

  async notifyUser(userId: number, data: CreateNotificationData) {
    const notification = await this.notificationRepository.create(
      userId,
      data,
    );
    this.eventsGateway.emitToUser(userId, 'notification.new', {
      id: notification.id,
      title: notification.title,
      type: notification.type,
      createdAt: notification.createdAt,
    });
    return notification;
  }
}
