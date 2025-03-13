import { Client } from "@/domains/client";
import { IResults } from "./IResults";

export interface IClientRepository {
  findAll(): Promise<Client[]>;
  bulkCreateUpdate(clients: Partial<Client>[]): Promise<IResults[]>;
}
