import { IClientRepository } from "./interfaces/IClientRepository";
import { Client } from "@/domain/client";

export class ClientAppService {
  constructor(private readonly clientRepository: IClientRepository) {}

  async getClients() {
    return this.clientRepository.findAll();
  }

  async bulkCreateUpdate(clients: Client[]) {
    return this.clientRepository.bulkCreateUpdate(clients);
  }
}
