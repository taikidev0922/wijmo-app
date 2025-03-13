export class Client {
  constructor(
    public readonly id: string | undefined,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly postalCode?: string,
    public readonly prefecture?: string,
    public readonly businessType?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(client: Client) {
    return new Client(
      client.id,
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
}
