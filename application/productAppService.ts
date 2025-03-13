import { IProductRepository } from "./interfaces/IProductRepository";
import { Product } from "@/domains/product";

export class ProductAppService {
  constructor(private readonly productRepository: IProductRepository) {}

  async getProducts() {
    return this.productRepository.findAll();
  }

  async bulkCreateUpdate(products: Product[]) {
    return this.productRepository.bulkCreateUpdate(products);
  }
}
