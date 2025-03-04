import Dexie, { type EntityTable } from "dexie";
import { Client } from "@/domain/client";
import { Product } from "@/domain/product";

const db = new Dexie("wijmo-db") as Dexie & {
  clients: EntityTable<Client, "id">;
  products: EntityTable<Product, "id">;
};

db.version(1).stores({
  clients:
    "++id, &name, email, phone, postalCode, prefecture, businessType, createdAt, updatedAt",
  products:
    "++id, &name, description, price, quantity, category, createdAt, updatedAt",
});

export type { Client, Product };
export { db };

export function resetDatabase() {
  return db.transaction("rw", db.clients, db.products, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
}

export async function generateDummyData() {
  await db.transaction("rw", db.clients, db.products, async () => {
    const clients = Array.from({ length: 10000 }, (_, i) => {
      return Client.create({
        id: (i + 1).toString(),
        name: `ダミー${i + 1}`,
        email: `dummy${i + 1}@example.com`,
        phone: `0${Math.floor(Math.random() * 90 + 10)}-${Math.floor(
          Math.random() * 9000 + 1000
        )}-${Math.floor(Math.random() * 9000 + 1000)}`,
        postalCode: `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(
          Math.random() * 9000 + 1000
        )}`,
        prefecture: ["東京都", "神奈川県", "埼玉県", "千葉県", "大阪府"][
          Math.floor(Math.random() * 5)
        ],
        businessType: ["小売", "卸売", "製造", "サービス", "その他"][
          Math.floor(Math.random() * 5)
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    await db.clients.bulkAdd(clients);
  });
}
