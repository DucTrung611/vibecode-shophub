import { Injectable } from '@nestjs/common';
import type { Order, Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import {
  ORDER_DETAIL_INCLUDE,
  ORDER_LIST_INCLUDE,
  OrderDetail,
  OrderListItem,
} from './entities/order.entity';
import {
  OrderItemForReview,
  OrderPort,
  PlatformOrderStats,
  RevenueBar,
  ShopOrderStats,
} from './order.port';
import { OrderListFilters, OrderStatusValue } from './types/order.types';
import { generateOrderCode } from './utils/order-code.util';

export interface CreateOrderItemInput {
  productId: number;
  variantId: number;
  productNameSnapshot: string;
  variantAttrsSnapshot: unknown;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CreateShopOrderInput {
  shopId: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  items: CreateOrderItemInput[];
}

export interface CreateOrderGroupInput {
  buyerId: number;
  shippingAddress: Record<string, unknown>;
  orders: CreateShopOrderInput[];
}

export interface CreatePaymentData {
  method: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  providerTxnId?: string;
  paidAt?: Date;
}

@Injectable()
export class OrderRepository implements OrderPort {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderGroupWithOrders(input: CreateOrderGroupInput) {
    return this.prisma.$transaction(async (tx) => {
      const orderGroup = await tx.orderGroup.create({
        data: { buyerId: input.buyerId },
      });

      const orders: Order[] = [];
      for (const orderInput of input.orders) {
        const created = await tx.order.create({
          data: {
            orderGroupId: orderGroup.id,
            orderCode: `PENDING-${orderGroup.id}-${orderInput.shopId}-${Date.now()}`,
            buyerId: input.buyerId,
            shopId: orderInput.shopId,
            subtotal: orderInput.subtotal,
            shippingFee: orderInput.shippingFee,
            totalAmount: orderInput.totalAmount,
            shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
          },
        });

        const withCode = await tx.order.update({
          where: { id: created.id },
          data: { orderCode: generateOrderCode(created.id) },
        });

        await tx.orderItem.createMany({
          data: orderInput.items.map((item) => ({
            orderId: created.id,
            productId: item.productId,
            variantId: item.variantId,
            productNameSnapshot: item.productNameSnapshot,
            variantAttrsSnapshot:
              item.variantAttrsSnapshot as Prisma.InputJsonValue,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        });

        orders.push(withCode);
      }

      return { orderGroup, orders };
    });
  }

  async findManyForBuyer(
    buyerId: number,
    filters: OrderListFilters,
  ): Promise<{ items: OrderListItem[]; total: number }> {
    const where = {
      buyerId,
      ...(filters.status ? { status: filters.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: ORDER_LIST_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total };
  }

  async findManyForShop(
    shopId: number,
    filters: OrderListFilters,
  ): Promise<{ items: OrderListItem[]; total: number }> {
    const where = {
      shopId,
      ...(filters.status ? { status: filters.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: ORDER_LIST_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total };
  }

  findByIdDetail(id: number): Promise<OrderDetail | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: ORDER_DETAIL_INCLUDE,
    });
  }

  updateStatus(id: number, status: OrderStatusValue) {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  createShipment(
    orderId: number,
    data: {
      carrier?: string;
      trackingNumber?: string;
      status: string;
      shippedAt?: Date;
    },
  ) {
    return this.prisma.shipment.create({ data: { orderId, ...data } });
  }

  markLatestShipmentDelivered(orderId: number) {
    return this.prisma.shipment.updateMany({
      where: { orderId },
      data: { status: 'delivered', deliveredAt: new Date() },
    });
  }

  createPayment(orderId: number, data: CreatePaymentData) {
    return this.prisma.payment.create({ data: { orderId, ...data } });
  }

  markOrderPaid(orderId: number) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'paid' },
    });
  }

  async findOrderItemForReview(
    orderItemId: number,
    userId: number,
  ): Promise<OrderItemForReview | null> {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: { select: { buyerId: true } } },
    });
    if (!item || item.order.buyerId !== userId) return null;
    return { id: item.id, productId: item.productId };
  }

  async getShopOrderStats(shopId: number): Promise<ShopOrderStats> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      last7DaysOrders,
      statusGroups,
      totalOrders,
      cancelledCount,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: { shopId, createdAt: { gte: startOfToday } },
        select: { totalAmount: true },
      }),
      this.prisma.order.findMany({
        where: { shopId, createdAt: { gte: sevenDaysAgo } },
        select: { totalAmount: true, createdAt: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: { shopId },
        _count: { _all: true },
      }),
      this.prisma.order.count({ where: { shopId } }),
      this.prisma.order.count({ where: { shopId, status: 'cancelled' } }),
      this.prisma.order.findMany({
        where: { shopId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderCode: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      todayRevenue: todayOrders.reduce(
        (s, o) => s + o.totalAmount.toNumber(),
        0,
      ),
      last7DaysRevenue: bucketByDay(last7DaysOrders, 7),
      statusBreakdown: statusGroups.map((g) => ({
        status: g.status,
        count: g._count._all,
      })),
      cancelRate: totalOrders > 0 ? cancelledCount / totalOrders : 0,
      totalOrders,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        status: o.status,
        totalAmount: o.totalAmount.toNumber(),
        createdAt: o.createdAt,
      })),
    };
  }

  async getPlatformOrderStats(): Promise<PlatformOrderStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 55);
    eightWeeksAgo.setHours(0, 0, 0, 0);

    const [totalOrders, last30dOrders, last8WeeksOrders] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { totalAmount: true },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: eightWeeksAgo } },
        select: { totalAmount: true, createdAt: true },
      }),
    ]);

    return {
      totalOrders,
      gmv30d: last30dOrders.reduce((s, o) => s + o.totalAmount.toNumber(), 0),
      gmvWeekly8: bucketByWeek(last8WeeksOrders, 8),
    };
  }

  async getCarrierPerformance() {
    const grouped = await this.prisma.shipment.groupBy({
      by: ['carrier', 'status'],
      _count: { _all: true },
    });
    const byCarrier = new Map<
      string,
      { carrier: string; total: number; delivered: number }
    >();
    for (const row of grouped) {
      const carrier = row.carrier ?? 'Không xác định';
      const entry = byCarrier.get(carrier) ?? {
        carrier,
        total: 0,
        delivered: 0,
      };
      entry.total += row._count._all;
      if (row.status === 'delivered') entry.delivered += row._count._all;
      byCarrier.set(carrier, entry);
    }
    return Array.from(byCarrier.values()).map((e) => ({
      carrier: e.carrier,
      totalShipments: e.total,
      delivered: e.delivered,
      deliveryRate: e.total > 0 ? e.delivered / e.total : 0,
    }));
  }
}

function bucketByDay(
  orders: { totalAmount: Prisma.Decimal; createdAt: Date }[],
  days: number,
): RevenueBar[] {
  const buckets: RevenueBar[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const value = orders
      .filter((o) => o.createdAt >= day && o.createdAt < next)
      .reduce((s, o) => s + o.totalAmount.toNumber(), 0);
    buckets.push({
      label: day.toLocaleDateString('vi-VN', { weekday: 'short' }),
      value,
    });
  }
  return buckets;
}

function bucketByWeek(
  orders: { totalAmount: Prisma.Decimal; createdAt: Date }[],
  weeks: number,
): RevenueBar[] {
  const buckets: RevenueBar[] = Array.from({ length: weeks }, (_, i) => ({
    label: `Tuần ${i + 1}`,
    value: 0,
  }));
  const now = Date.now();
  for (const o of orders) {
    const weeksAgo = Math.floor(
      (now - o.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
    const bucket = weeks - 1 - weeksAgo;
    if (bucket >= 0 && bucket < weeks) {
      buckets[bucket].value += o.totalAmount.toNumber();
    }
  }
  return buckets;
}
