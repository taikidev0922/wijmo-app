import { IOrderRepository } from "@/application/interfaces/IOrderRepository";
import { db } from "../db";
import { Operation } from "@/enums/Operation";
import { IResults } from "@/application/interfaces/IResults";
import { Order } from "@/domains/order";
import { OrderDetail } from "@/domains/orderDetail";
import { Client } from "@/domains/client";
import { convertErrorMessage } from "@/utils/convertErrorMessage";
import { DexieError } from "dexie";
import { Product } from "@/domains/product";

export class OrderRepository implements IOrderRepository {
  async findAll(): Promise<Order[]> {
    const orders = await db.orders.toArray();
    const orderPromises = orders.map(async (order) => {
      const client = await db.clients.get(order.clientId);
      const orderDetails = await db.orderDetails
        .where("orderId")
        .equals(order.id ?? "")
        .toArray();

      const detailPromises = orderDetails.map(async (detail) => {
        const product = await db.products.get(detail.productId);
        return OrderDetail.create({
          ...detail,
          product,
        } as OrderDetail);
      });

      const populatedDetails = await Promise.all(detailPromises);

      return Order.create(
        new Order(
          order.id,
          undefined,
          undefined,
          order.orderNo,
          order.orderDate,
          order.clientId,
          client as Client,
          populatedDetails,
          order.createdAt,
          order.updatedAt
        )
      );
    });

    return Promise.all(orderPromises);
  }

  async findByOrderNo(orderNo: string): Promise<Order | null> {
    const order = await db.orders.where("orderNo").equals(orderNo).first();

    if (!order) return null;

    const client = await db.clients.get(order.clientId);
    const orderDetails = await db.orderDetails
      .where("orderId")
      .equals(order.id ?? "")
      .toArray();

    const detailPromises = orderDetails.map(async (detail) => {
      const product = await db.products.get(detail.productId);
      return OrderDetail.create({
        ...detail,
        product,
      } as OrderDetail);
    });

    const populatedDetails = await Promise.all(detailPromises);

    return Order.create(
      new Order(
        order.id,
        undefined,
        undefined,
        order.orderNo,
        order.orderDate,
        order.clientId,
        client as Client,
        populatedDetails,
        order.createdAt,
        order.updatedAt
      )
    );
  }

  private async generateOrderNo(): Promise<string> {
    const orders = await db.orders.toArray();

    if (orders.length === 0) {
      return "000001";
    }

    const orderNumbers = orders
      .map((order) => order.orderNo)
      .filter((orderNo) => /^\d+$/.test(orderNo))
      .map((orderNo) => parseInt(orderNo, 10))
      .filter((num) => !isNaN(num));

    if (orderNumbers.length === 0) {
      return "000001";
    }

    const maxOrderNo = Math.max(...orderNumbers);

    const nextOrderNo = (maxOrderNo + 1).toString().padStart(6, "0");

    return nextOrderNo;
  }

  async createUpdate(order: Order): Promise<IResults[]> {
    const results: IResults[] = [];

    try {
      await db.transaction(
        "rw",
        [db.orders, db.orderDetails, db.products],
        async () => {
          const inventoryChanges = new Map<string, number>();

          for (const detail of order.orderDetails) {
            const product = await db.products.get(detail.productId);
            if (!product) {
              results.push({
                uid: detail.uid ?? 0,
                error: "Product not found",
              });
              throw new Error("Product not found");
            }

            const currentInventory =
              product.quantity - (inventoryChanges.get(product.id ?? "") ?? 0);

            switch (detail.operation) {
              case Operation.Insert:
                if (currentInventory < detail.quantity) {
                  results.push({
                    uid: detail.uid ?? 0,
                    error: `商品${product.code}の在庫が不足しています。在庫数: ${currentInventory}、注文数: ${detail.quantity}`,
                  });
                  throw new Error("Insufficient inventory");
                }
                inventoryChanges.set(
                  product.id ?? "",
                  (inventoryChanges.get(product.id ?? "") ?? 0) +
                    detail.quantity
                );
                break;

              case Operation.Update:
                if (detail.id) {
                  const existingDetail = await db.orderDetails.get(detail.id);
                  if (!existingDetail) {
                    results.push({
                      uid: detail.uid ?? 0,
                      error: "Order detail not found",
                    });
                    throw new Error("Order detail not found");
                  }

                  const quantityDiff =
                    detail.quantity - (existingDetail.quantity ?? 0);
                  if (currentInventory < quantityDiff) {
                    results.push({
                      uid: detail.uid ?? 0,
                      error: `商品${product.code}の在庫が不足しています。在庫数: ${currentInventory}, 追加必要数: ${quantityDiff}`,
                    });
                    throw new Error("Insufficient inventory");
                  }
                  if (quantityDiff !== 0) {
                    inventoryChanges.set(
                      product.id ?? "",
                      (inventoryChanges.get(product.id ?? "") ?? 0) +
                        quantityDiff
                    );
                  }
                }
                break;

              case Operation.Delete:
                if (detail.id) {
                  const deletingDetail = await db.orderDetails.get(detail.id);
                  if (deletingDetail) {
                    inventoryChanges.set(
                      product.id ?? "",
                      (inventoryChanges.get(product.id ?? "") ?? 0) -
                        (deletingDetail.quantity ?? 0)
                    );
                  }
                }
                break;
            }
          }

          let orderId: string;
          if (order.id) {
            await db.orders.update(order.id, {
              orderNo: order.orderNo,
              orderDate: order.orderDate,
              clientId: order.clientId,
              updatedAt: new Date(),
            });
            orderId = order.id;
          } else {
            const orderNo = await this.generateOrderNo();
            const newOrder = Order.create({
              id: undefined,
              orderNo: orderNo,
              orderDate: order.orderDate,
              clientId: order.clientId,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Order);

            orderId = (await db.orders.add(newOrder.toModel())) as string;
          }

          for (const detail of order.orderDetails) {
            try {
              const product = await db.products.get(detail.productId);
              if (!product) continue;

              switch (detail.operation) {
                case Operation.Insert:
                  const newDetail = OrderDetail.create({
                    id: crypto.randomUUID(),
                    orderId: orderId,
                    productId: detail.productId,
                    quantity: detail.quantity,
                  } as OrderDetail);

                  const updatedProduct = Product.create(
                    new Product(
                      product.id,
                      undefined,
                      undefined,
                      product.code,
                      product.name,
                      product.description,
                      product.price,
                      product.quantity - detail.quantity,
                      product.category,
                      product.createdAt,
                      product.updatedAt
                    )
                  );
                  await db.products.update(
                    detail.productId,
                    updatedProduct.toModel()
                  );
                  await db.orderDetails.add(newDetail.toModel());
                  break;

                case Operation.Update:
                  if (detail.id) {
                    const existingDetail = await db.orderDetails.get(detail.id);
                    if (!existingDetail) continue;

                    const quantityDiff =
                      detail.quantity - (existingDetail.quantity ?? 0);
                    const updatedProductForUpdate = Product.create(
                      new Product(
                        product.id,
                        undefined,
                        undefined,
                        product.code,
                        product.name,
                        product.description,
                        product.price,
                        product.quantity - quantityDiff,
                        product.category,
                        product.createdAt,
                        product.updatedAt
                      )
                    );
                    await db.products.update(
                      detail.productId,
                      updatedProductForUpdate.toModel()
                    );
                    await db.orderDetails.update(detail.id, {
                      productId: detail.productId,
                      quantity: detail.quantity,
                    });
                  }
                  break;

                case Operation.Delete:
                  if (detail.id) {
                    const deletingDetail = await db.orderDetails.get(detail.id);
                    if (deletingDetail) {
                      const updatedProductForDelete = Product.create(
                        new Product(
                          product.id,
                          undefined,
                          undefined,
                          product.code,
                          product.name,
                          product.description,
                          product.price,
                          product.quantity + (deletingDetail.quantity ?? 0),
                          product.category,
                          product.createdAt,
                          product.updatedAt
                        )
                      );
                      await db.products.update(
                        detail.productId,
                        updatedProductForDelete.toModel()
                      );
                    }
                    await db.orderDetails.delete(detail.id);
                  }
                  break;
              }
            } catch (error) {
              results.push({
                uid: detail.uid ?? 0,
                error: convertErrorMessage(error as DexieError),
              });
              throw error;
            }
          }
        }
      );

      return results;
    } catch {
      return results;
    }
  }

  async delete(orderNo: string): Promise<void> {
    await db.orders.where("orderNo").equals(orderNo).delete();
  }
}
