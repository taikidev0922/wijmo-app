export class Product {
  constructor(
    public readonly id: string | undefined,
    public readonly code: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly quantity: number,
    public readonly category: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(product: Product) {
    return new Product(
      product.id,
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
}
