import { IClientRepository } from "@/application/interfaces/IClientRepository";
import { Client } from "@/domains/client";
import { db } from "../db";
import { Operation } from "@/enums/Operation";
import { IResults } from "@/application/interfaces/IResults";
import { DexieError } from "dexie";
import { convertErrorMessage } from "@/utils/convertErrorMessage";
export class ClientRepository implements IClientRepository {
  async findAll(): Promise<Client[]> {
    const clients = await db.clients.toArray();
    return clients.map((client) =>
      Client.create(
        new Client(
          client.id,
          undefined,
          undefined,
          client.name ?? "",
          client.email ?? "",
          client.phone ?? "",
          client.postalCode ?? "",
          client.prefecture ?? "",
          client.businessType ?? "",
          client.createdAt ?? new Date(),
          client.updatedAt ?? new Date()
        )
      )
    );
  }

  async bulkCreateUpdate(clients: Client[]): Promise<IResults[]> {
    const results: IResults[] = [];
    try {
      await db.transaction("rw", db.clients, async () => {
        for (const client of clients) {
          if (client.operation === Operation.Insert) {
            try {
              await db.clients.add(Client.create(client as Client).toModel());
            } catch (error) {
              results.push({
                uid: client.uid ?? 0,
                error: convertErrorMessage(error as DexieError),
              });
            }
          } else if (client.operation === Operation.Update) {
            try {
              await db.clients.put(Client.create(client as Client).toModel());
            } catch (error) {
              results.push({
                uid: client.uid ?? 0,
                error: convertErrorMessage(error as DexieError),
              });
            }
          } else if (client.operation === Operation.Delete) {
            try {
              await db.clients.delete(client.id as string);
            } catch (error) {
              results.push({
                uid: client.uid ?? 0,
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
