import { Injectable } from '@nestjs/common';
import type { Order, Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import {
  ORDER_DETAIL_INCLUDE,
  ORDER_LIST_INCLUDE,
  OrderDetail,
  OrderListItem,
} from './entities/order.entity';
import { OrderItemForReview, OrderPort } from './order.port';
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
}
