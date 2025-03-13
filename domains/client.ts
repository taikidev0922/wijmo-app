import { Client as ClientModel } from "@/models/client";
import { Operation } from "@/enums/Operation";
export class Client {
  constructor(
    public readonly id: string | undefined,
    public readonly uid: number | undefined,
    public readonly operation: Operation | undefined,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly postalCode: string,
    public readonly prefecture: string,
    public readonly businessType: string,
    public readonly createdAt: Date | undefined,
    public readonly updatedAt: Date | undefined
  ) {}

  static create(client: Client) {
    return new Client(
      client.id,
      client.uid,
      client.operation,
      client.name,
      client.email,
      client.phone,
      client.postalCode,
      client.prefecture,
      client.businessType,
      client.createdAt,
      client.updatedAt
    );
  }

  toModel(): ClientModel {
    return new ClientModel(
      this.id ?? undefined,
      this.name ?? "",
      this.email ?? "",
      this.phone ?? "",
      this.postalCode ?? "",
      this.prefecture ?? "",
      this.businessType ?? "",
      this.createdAt,
      this.updatedAt
    );
  }
}
