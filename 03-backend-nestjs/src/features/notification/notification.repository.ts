import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

export interface CreateNotificationData {
  title: string;
  content: string;
  type: 'order_update' | 'promotion' | 'system';
  referenceId?: number;
}

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: number, page: number, limit: number) {
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: number) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  markRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  markAllRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  create(userId: number, data: CreateNotificationData) {
    return this.prisma.notification.create({ data: { userId, ...data } });
  }
}
