import { MikroTikClient } from "./client";
import { HotspotManager } from "./hotspot";
// import { PPPoEManager } from './pppoe'; // For future
import { NetworkProvider } from "../../interfaces/network-provider.interface";
import { UserCredentials, Plan, UsageData, MikroTikConfig } from "../../types";

export class MikroTikProvider implements NetworkProvider {
  private client: MikroTikClient;
  private hotspot: HotspotManager;
  // private pppoe: PPPoEManager; // For future

  constructor(config: MikroTikConfig) {
    this.client = new MikroTikClient(config);
    this.hotspot = new HotspotManager(this.client);
    // this.pppoe = new PPPoEManager(this.client);
  }

  // User management
  async createUser(phone: string, plan: Plan): Promise<UserCredentials> {
    // You can switch between hotspot and PPPoE here
    return await this.hotspot.createUser(phone, plan);
    // return await this.pppoe.createUser(phone, plan); // Alternative
  }

  async disableUser(username: string): Promise<boolean> {
    return await this.hotspot.disableUser(username);
  }

  async checkUserStatus(username: string): Promise<boolean> {
    return await this.hotspot.checkUserStatus(username);
  }

  // Usage tracking
  async getUserUsage(username: string): Promise<UsageData | null> {
    return await this.hotspot.getUserUsage(username);
  }

  // Bulk operations
  async createManyUsers(
    users: Array<{ phone: string; plan: Plan }>,
  ): Promise<UserCredentials[]> {
    return await this.hotspot.createManyUsers(users);
  }

  async disableExpiredUsers(expiryDate: number): Promise<number> {
    // This would need a more complex implementation
    // For now, return 0
    return 0;
  }

  // Connection management
  async disconnect() {
    await this.client.disconnect();
  }
}
