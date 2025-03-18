import { OrderAppService } from "./orderAppService";
import { OrderRepository } from "@/infrastructure/repository/orderRepository";
import { ClientAppService } from "./clientAppService";
import { ClientRepository } from "@/infrastructure/repository/clientRepository";
import { ProductAppService } from "./productAppService";
import { ProductRepository } from "@/infrastructure/repository/productRepository";

export interface MonthlyOrderAmount {
  month: string;
  amount: number;
}

export interface YearlyOrderAmount {
  year: string;
  amount: number;
}

export interface CategorySales {
  category: string;
  amount: number;
}

export interface BusinessTypeCount {
  type: string;
  count: number;
}

export interface LowStockProduct {
  code: string;
  name: string;
  quantity: number;
}

export type TimeUnit = "month" | "year";

export class DashboardService {
  private orderAppService: OrderAppService;
  private clientAppService: ClientAppService;
  private productAppService: ProductAppService;

  constructor() {
    this.orderAppService = new OrderAppService(new OrderRepository());
    this.clientAppService = new ClientAppService(new ClientRepository());
    this.productAppService = new ProductAppService(new ProductRepository());
  }

  async getMonthlyOrderAmounts(
    timeUnit: TimeUnit = "month"
  ): Promise<MonthlyOrderAmount[] | YearlyOrderAmount[]> {
    const orders = await this.orderAppService.getOrders();

    if (timeUnit === "year") {
      const yearlyAmounts = new Map<string, number>();

      orders.forEach((order) => {
        const year = new Date(order.orderDate).toLocaleDateString("ja-JP", {
          year: "numeric",
        });
        const amount = order.orderDetails.reduce(
          (sum, detail) => sum + (detail.quantity * detail.product?.price || 0),
          0
        );
        yearlyAmounts.set(year, (yearlyAmounts.get(year) || 0) + amount);
      });

      return Array.from(yearlyAmounts.entries())
        .map(([year, amount]) => ({ year, amount }))
        .sort((a, b) => a.year.localeCompare(b.year))
        .slice(-7);
    } else {
      const monthlyAmounts = new Map<string, number>();

      orders.forEach((order) => {
        const month = new Date(order.orderDate).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
        });
        const amount = order.orderDetails.reduce(
          (sum, detail) => sum + (detail.quantity * detail.product?.price || 0),
          0
        );
        monthlyAmounts.set(month, (monthlyAmounts.get(month) || 0) + amount);
      });

      return Array.from(monthlyAmounts.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-7);
    }
  }

  async getCategorySales(): Promise<CategorySales[]> {
    const orders = await this.orderAppService.getOrders();
    const categoryAmounts = new Map<string, number>();

    orders.forEach((order) => {
      order.orderDetails.forEach((detail) => {
        const category = detail.product?.category || "未分類";
        const amount = detail.quantity * (detail.product?.price || 0);
        categoryAmounts.set(
          category,
          (categoryAmounts.get(category) || 0) + amount
        );
      });
    });

    return Array.from(categoryAmounts.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  async getBusinessTypeCounts(): Promise<BusinessTypeCount[]> {
    const clients = await this.clientAppService.getClients();
    const typeCounts = new Map<string, number>();

    clients.forEach((client) => {
      const type = client.businessType || "未分類";
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    return Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getLowStockProducts(): Promise<LowStockProduct[]> {
    const products = await this.productAppService.getProducts();
    return products
      .map((product) => ({
        code: product.code,
        name: product.name,
        quantity: product.quantity,
      }))
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
  }
}
