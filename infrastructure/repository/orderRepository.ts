import { IOrderRepository } from "@/application/interfaces/IOrderRepository";
import { db } from "../db";
import { Operation } from "@/enums/Operation";
import { IResults } from "@/application/interfaces/IResults";
import { Order } from "@/domains/order";
import { OrderDetail } from "@/domains/orderDetail";
import { Client } from "@/domains/client";
import { convertErrorMessage } from "@/utils/convertErrorMessage";
import { DexieError } from "dexie";

export class OrderRepository implements IOrderRepository {
  async findAll(): Promise<Order[]> {
    const orders = await db.orders.toArray();
    const orderPromises = orders.map(async (order) => {
      const client = await db.clients.get(order.clientId);
      const orderDetails = await db.orderDetails
        .where("orderId")
        .equals(order.id ?? "")
        .toArray();

      // Get product for each order detail
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

    // 関連データを取得
    const client = await db.clients.get(order.clientId);
    const orderDetails = await db.orderDetails
      .where("orderId")
      .equals(order.id ?? "")
      .toArray();

    // Get product for each order detail
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

    // If no valid numbers found, start from 1
    if (orderNumbers.length === 0) {
      return "000001";
    }

    const maxOrderNo = Math.max(...orderNumbers);

    // Generate next order number (6 digits)
    const nextOrderNo = (maxOrderNo + 1).toString().padStart(6, "0");

    return nextOrderNo;
  }

  async createUpdate(order: Order): Promise<IResults[]> {
    const results: IResults[] = [];

    try {
      await db.transaction("rw", [db.orders, db.orderDetails], async () => {
        // 注文データ処理
        let orderId: string;
        if (order.id) {
          // 既存の注文を更新
          await db.orders.update(order.id, {
            orderNo: order.orderNo,
            orderDate: order.orderDate,
            clientId: order.clientId,
            updatedAt: new Date(),
          });
          orderId = order.id;
        } else {
          // 新規注文を作成
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

        // 注文詳細の処理
        for (const detail of order.orderDetails) {
          try {
            switch (detail.operation) {
              case Operation.Insert:
                // 新規詳細を作成
                const newDetail = OrderDetail.create({
                  id: crypto.randomUUID(),
                  orderId: orderId,
                  productId: detail.productId,
                  quantity: detail.quantity,
                } as OrderDetail);

                await db.orderDetails.add(newDetail.toModel());
                break;

              case Operation.Update:
                // 既存詳細を更新
                if (detail.id) {
                  await db.orderDetails.update(detail.id, {
                    productId: detail.productId,
                    quantity: detail.quantity,
                  });
                }
                break;

              case Operation.Delete:
                // 詳細を削除
                if (detail.id) {
                  await db.orderDetails.delete(detail.id);
                }
                break;
            }
          } catch (error) {
            // 各詳細の処理でエラーが発生した場合
            results.push({
              uid: detail.uid ?? 0,
              error: convertErrorMessage(error as DexieError),
            });
          }
        }
      });

      return results;
    } catch (error) {
      // 注文処理で例外が発生した場合はそのままスロー
      console.error("注文の作成/更新中にエラーが発生しました:", error);
      throw error;
    }
  }

  async delete(orderNo: string): Promise<void> {
    await db.orders.where("orderNo").equals(orderNo).delete();
  }
}
