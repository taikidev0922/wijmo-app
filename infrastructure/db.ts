import Dexie, { type EntityTable } from "dexie";
import { Client } from "@/models/client";
import { Product } from "@/models/product";
import { Order } from "@/models/order";
import { OrderDetail } from "@/models/orderDetail";
import { categorys } from "@/datas/categorys";
import { businessTypeMap } from "@/datas/businessTypes";
import { prefectureMap } from "@/datas/prefectures";
import { fakerJA as faker } from "@faker-js/faker";

const db = new Dexie("wijmo-db") as Dexie & {
  clients: EntityTable<Client, "id">;
  products: EntityTable<Product, "id">;
  orders: EntityTable<Order, "id">;
  orderDetails: EntityTable<OrderDetail, "id">;
};

db.version(1).stores({
  clients:
    "++id, &name, email, phone, postalCode, prefecture, businessType, createdAt, updatedAt",
  products:
    "++id, &code, &name, description, price, quantity, category, createdAt, updatedAt",
  orders: "++id, &orderNo, clientId, createdAt, updatedAt",
  orderDetails: "++id, orderId, productId, quantity",
});

export type { Client, Product, Order, OrderDetail };
export { db };

export function resetDatabase() {
  return db.transaction(
    "rw",
    db.clients,
    db.products,
    db.orders,
    db.orderDetails,
    async () => {
      await Promise.all(db.tables.map((table) => table.clear()));
    }
  );
}

export async function generateDummyData() {
  await db.transaction(
    "rw",
    db.clients,
    db.products,
    db.orders,
    db.orderDetails,
    async () => {
      const usedClientNames = new Set<string>();
      const clients = Array.from({ length: 1000 }, () => {
        let name;
        do {
          name = faker.company.name();
          if (usedClientNames.has(name)) {
            name = `${name}_${faker.number.int({ min: 1, max: 99999 })}`;
          }
        } while (usedClientNames.has(name));
        usedClientNames.add(name);

        return Client.create({
          id: undefined,
          name: name,
          email: faker.internet.email(),
          phone: faker.phone.number(),
          postalCode: faker.location.zipCode(),
          prefecture: faker.helpers.arrayElement(Object.values(prefectureMap)),
          businessType: faker.helpers.arrayElement(
            Object.values(businessTypeMap)
          ),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await db.clients.bulkAdd(clients);

      const savedClients = await db.clients.toArray();

      const usedProductNames = new Set<string>();
      const products = Array.from({ length: 100 }, (_, index) => {
        const code = String(index + 1).padStart(4, "0");

        let productName;
        do {
          productName = faker.commerce.productName();
          if (usedProductNames.has(productName)) {
            productName = `${productName}_${faker.number.int({
              min: 1,
              max: 99999,
            })}`;
          }
        } while (usedProductNames.has(productName));
        usedProductNames.add(productName);

        return Product.create({
          id: undefined,
          code: code,
          name: productName,
          description: faker.commerce.productDescription(),
          price: parseFloat(
            faker.commerce.price({
              min: 1000,
              max: 10000,
              dec: 0,
            })
          ),
          quantity: faker.number.int({ min: 1, max: 100 }),
          category: categorys[Math.floor(Math.random() * categorys.length)],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await db.products.bulkAdd(products);

      const savedProducts = await db.products.toArray();

      const today = new Date();
      const sevenYearsAgo = new Date(today);
      sevenYearsAgo.setFullYear(today.getFullYear() - 7);

      const orders = Array.from({ length: 500 }, (_, index) => {
        const orderNo = String(index + 1).padStart(6, "0");
        const clientId = savedClients[
          Math.floor(Math.random() * savedClients.length)
        ].id as string;

        const orderDate = new Date(
          sevenYearsAgo.getTime() +
            Math.random() * (today.getTime() - sevenYearsAgo.getTime())
        );
        orderDate.setHours(0, 0, 0, 0);

        return Order.create({
          id: undefined,
          orderNo: orderNo,
          clientId: clientId,
          orderDate: orderDate,
          createdAt: orderDate,
          updatedAt: orderDate,
        });
      });

      orders.sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime());

      await db.orders.bulkAdd(orders);

      const savedOrders = await db.orders.toArray();
      const orderIds = savedOrders.map((order) => order.id as string);

      const orderDetails = orderIds.flatMap((orderId) => {
        const detailCount = Math.floor(Math.random() * 6) + 5;
        return Array.from({ length: detailCount }, () => {
          const product =
            savedProducts[Math.floor(Math.random() * savedProducts.length)];
          return OrderDetail.create({
            id: undefined,
            orderId: orderId,
            productId: product.id as string,
            quantity: Math.floor(Math.random() * 10) + 1,
          });
        });
      });

      await db.orderDetails.bulkAdd(orderDetails);
    }
  );
}
