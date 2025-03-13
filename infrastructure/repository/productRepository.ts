import { IProductRepository } from "@/application/interfaces/IProductRepository";
import { Product } from "@/domains/product";
import { db } from "../db";
import { Operation } from "@/enums/Operation";
import { IResults } from "@/application/interfaces/IResults";
import { DexieError } from "dexie";
import { convertErrorMessage } from "@/utils/convertErrorMessage";

export class ProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    const products = await db.products.toArray();
    return products.map((product) =>
      Product.create(
        new Product(
          product.id,
          undefined,
          undefined,
          product.code,
          product.name ?? "",
          product.description ?? "",
          product.price ?? 0,
          product.quantity ?? 0,
          product.category ?? "",
          product.createdAt,
          product.updatedAt
        )
      )
    );
  }

  async bulkCreateUpdate(products: Product[]): Promise<IResults[]> {
    const results: IResults[] = [];
    try {
      await db.transaction("rw", db.products, async () => {
        for (const product of products) {
          if (product.operation === Operation.Insert) {
            try {
              await db.products.add(
                Product.create(product as Product).toModel()
              );
            } catch (error) {
              results.push({
                uid: product.uid ?? 0,
                error: convertErrorMessage(error as DexieError),
              });
            }
          } else if (product.operation === Operation.Update) {
            try {
              await db.products.put(
                Product.create(product as Product).toModel()
              );
            } catch (error) {
              results.push({
                uid: product.uid ?? 0,
                error: convertErrorMessage(error as DexieError),
              });
            }
          } else if (product.operation === Operation.Delete) {
            try {
              await db.products.delete(product.id as string);
            } catch (error) {
              results.push({
                uid: product.uid ?? 0,
                error: convertErrorMessage(error as DexieError),
              });
            }
          }
        }
      });
      return results;
    } catch (error) {
      throw error;
    }
  }
}
