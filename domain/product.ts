import { Operation } from "@/enums/Operation";
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly quantity: number,
    public readonly category: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly operation?: Operation
  ) {}
}
