import { Order } from "@/domains/order";
import { IResults } from "./IResults";

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findByOrderNo(orderNo: string): Promise<Order | null>;
  createUpdate(order: Order): Promise<IResults[]>;
  delete(orderNo: string): Promise<void>;
}
