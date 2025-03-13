import { Product } from "@/domains/product";
import { IResults } from "./IResults";

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  bulkCreateUpdate(products: Product[]): Promise<IResults[]>;
}
