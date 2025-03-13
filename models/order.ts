export class Order {
  constructor(
    public readonly id: string | undefined,
    public readonly orderNo: string,
    public readonly orderDate: Date,
    public readonly clientId: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(order: Order) {
    return new Order(
      order.id,
      order.orderNo,
      order.orderDate,
      order.clientId,
      order.createdAt,
      order.updatedAt
    );
  }
}
