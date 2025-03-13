import Dexie, { type EntityTable } from "dexie";
import { Client } from "@/models/client";
import { Product } from "@/models/product";
import { Order } from "@/models/order";
import { OrderDetail } from "@/models/orderDetail";
import { categorys } from "@/datas/categorys";
import { businessTypeMap } from "@/datas/businessTypes";
import { prefectureMap } from "@/datas/prefectures";
import { faker } from "@faker-js/faker";

const db = new Dexie("wijmo-db") as Dexie & {
  clients: EntityTable<Client, "id">;
  products: EntityTable<Product, "id">;
  orders: EntityTable<Order, "id">;
  orderDetails: EntityTable<OrderDetail, "id">; // Add orderDetails table
};

db.version(1).stores({
  clients:
    "++id, &name, email, phone, postalCode, prefecture, businessType, createdAt, updatedAt",
  products:
    "++id, &code, &name, description, price, quantity, category, createdAt, updatedAt",
  orders: "++id, &orderNo, clientId, createdAt, updatedAt", // Update orders table schema
  orderDetails: "++id, orderId, productId, quantity", // Define orderDetails table schema
});

export type { Client, Product, Order, OrderDetail }; // Export OrderDetail type
export { db };

export function resetDatabase() {
  return db.transaction(
    "rw",
    db.clients,
    db.products,
    db.orders,
    db.orderDetails,
    async () => {
      // Include orderDetails table
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
      // Include orderDetails table
      const usedClientNames = new Set<string>();
      const clients = Array.from({ length: 1000 }, () => {
        let name;
        do {
          name =
            faker.person.fullName() +
            "_" +
            faker.number.int({ min: 1, max: 99999 });
        } while (usedClientNames.has(name));
        usedClientNames.add(name);

        return Client.create({
          id: undefined,
          name: name,
          email: faker.internet.email(),
          phone: faker.phone.number({ style: "national" }),
          postalCode: faker.location.zipCode(),
          prefecture:
            prefectureMap[
              Math.floor(Math.random() * Object.keys(prefectureMap).length)
            ],
          businessType:
            businessTypeMap[
              Math.floor(Math.random() * Object.keys(businessTypeMap).length)
            ],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await db.clients.bulkAdd(clients);

      const usedProductNames = new Set<string>();
      const products = Array.from({ length: 100 }, (_, index) => {
        let productName;
        do {
          productName =
            faker.commerce.productName() +
            "_" +
            faker.number.int({ min: 1, max: 99999 });
        } while (usedProductNames.has(productName));
        usedProductNames.add(productName);

        // Format index+1 as 4 digit code with leading zeros
        const code = String(index + 1).padStart(4, "0");

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
    }
  );
}
