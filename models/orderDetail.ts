export class OrderDetail {
  constructor(
    public readonly id: string | undefined,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly quantity: number | null
  ) {}

  static create(orderDetail: OrderDetail) {
    return new OrderDetail(
      orderDetail.id,
      orderDetail.orderId,
      orderDetail.productId,
      orderDetail.quantity
    );
  }
}
