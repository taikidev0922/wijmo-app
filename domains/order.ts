import { Client } from "@/domains/client";
import { OrderDetail } from "@/domains/orderDetail";
import { Order as OrderModel } from "@/models/order";

export class Order {
  constructor(
    public readonly id: string | undefined,
    public readonly orderNo: string,
    public readonly orderDate: Date,
    public readonly clientId: string,
    public readonly client: Client,
    public readonly orderDetails: OrderDetail[],
    public readonly createdAt: Date | undefined,
    public readonly updatedAt: Date | undefined
  ) {}

  static create(order: Order) {
    return new Order(
      order.id,
      order.orderNo,
      order.orderDate,
      order.clientId,
      order.client,
      order.orderDetails,
      order.createdAt,
      order.updatedAt
    );
  }

  toModel(): OrderModel {
    return new OrderModel(
      this.id ?? undefined,
      this.orderNo,
      this.orderDate,
      this.clientId,
      this.createdAt,
      this.updatedAt
    );
  }
}
