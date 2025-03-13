import { IOrderRepository } from "@/application/interfaces/IOrderRepository";
import { Order } from "@/domains/order";

export class OrderAppService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async getOrders() {
    return this.orderRepository.findAll();
  }

  async getOrder(orderNo: string) {
    return this.orderRepository.findByOrderNo(orderNo);
  }

  async createUpdate(order: Order) {
    return this.orderRepository.createUpdate(order);
  }

  async deleteOrder(orderNo: string) {
    return this.orderRepository.delete(orderNo);
  }
}
