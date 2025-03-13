import { Product } from "@/domains/product";
import { OrderDetail as OrderDetailModel } from "@/models/orderDetail";
import { Operation } from "@/enums/Operation";
export class OrderDetail {
  constructor(
    public readonly id: string | undefined,
    public readonly uid: number | undefined,
    public readonly operation: Operation | undefined,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly product: Product,
    public readonly quantity: number,
    public readonly createdAt: Date | undefined,
    public readonly updatedAt: Date | undefined
  ) {}

  static create(orderDetail: OrderDetail) {
    return new OrderDetail(
      orderDetail.id,
      orderDetail.uid,
      orderDetail.operation,
      orderDetail.orderId,
      orderDetail.productId,
      orderDetail.product,
      orderDetail.quantity,
      orderDetail.createdAt,
      orderDetail.updatedAt
    );
  }

  toModel(): OrderDetailModel {
    return new OrderDetailModel(
      this.id ?? undefined,
      this.orderId ?? "",
      this.productId ?? "",
      this.quantity ?? 0
    );
  }
}
