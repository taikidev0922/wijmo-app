import { Operation } from "@/enums/Operation";
import { Product as ProductModel } from "@/models/product";

export class Product {
  constructor(
    public readonly id: string | undefined,
    public readonly uid: number | undefined,
    public readonly operation: Operation | undefined,
    public readonly code: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly quantity: number,
    public readonly category: string,
    public readonly createdAt: Date | undefined,
    public readonly updatedAt: Date | undefined
  ) {}

  static create(product: Product) {
    return new Product(
      product.id,
      product.uid,
      product.operation,
      product.code,
      product.name,
      product.description,
      product.price,
      product.quantity,
      product.category,
      product.createdAt,
      product.updatedAt
    );
  }

  toModel(): ProductModel {
    return new ProductModel(
      this.id ?? undefined,
      this.code ?? "",
      this.name ?? "",
      this.description ?? "",
      this.price ?? 0,
      this.quantity ?? 0,
      this.category ?? "",
      this.createdAt,
      this.updatedAt
    );
  }
}
