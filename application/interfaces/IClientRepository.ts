import { Client } from "@/domain/client";
import { IResults } from "./IResults";

export interface IClientRepository {
  findAll(): Promise<Client[]>;
  bulkCreateUpdate(clients: Partial<Client>[]): Promise<IResults[]>;
}
