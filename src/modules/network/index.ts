import {
  NetworkProvider,
  ProviderType,
} from "./interfaces/network-provider.interface";
import { MikroTikProvider } from "./providers/mikrotik";
// import { RadiusProvider } from './providers/radius'; // For future
import { MikroTikConfig } from "./types";

// Configuration from environment variables
const getConfig = () => {
  return {
    host: process.env.MIKROTIK_HOST!,
    user: process.env.MIKROTIK_USER!,
    password: process.env.MIKROTIK_PASSWORD!,
    port: parseInt(process.env.MIKROTIK_PORT || "8728"),
  };
};

/**
 * Network Provider Factory
 * Change this ONE LINE to switch providers!
 *
 * Current: 'mikrotik'
 * Future: 'radius' - when you're ready
 */
const PROVIDER: ProviderType = "mikrotik"; // 🔁 CHANGE THIS TO SWITCH PROVIDERS

class NetworkService {
  private provider: NetworkProvider | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    const config = getConfig();

    switch (PROVIDER) {
      case "mikrotik":
        this.provider = new MikroTikProvider(config);
        console.log("🌐 Network Provider: MikroTik API");
        break;

      case "radius":
        // this.provider = new RadiusProvider(config);
        console.log("🌐 Network Provider: FreeRADIUS (coming soon)");
        break;

      default:
        throw new Error(`Unknown provider: ${PROVIDER}`);
    }
  }

  // Public methods - these remain the same regardless of provider!
  async createUser(phone: string, plan: any) {
    if (!this.provider) throw new Error("Provider not initialized");
    return await this.provider.createUser(phone, plan);
  }

  async disableUser(username: string) {
    if (!this.provider) throw new Error("Provider not initialized");
    return await this.provider.disableUser(username);
  }

  async checkUserStatus(username: string) {
    if (!this.provider) throw new Error("Provider not initialized");
    return await this.provider.checkUserStatus(username);
  }

  async getUserUsage(username: string) {
    if (!this.provider) throw new Error("Provider not initialized");
    return await this.provider.getUserUsage(username);
  }

  async createManyUsers(users: Array<{ phone: string; plan: any }>) {
    if (!this.provider) throw new Error("Provider not initialized");
    return await this.provider.createManyUsers(users);
  }

  // Cleanup
  async disconnect() {
    if (this.provider && "disconnect" in this.provider) {
      await (this.provider as any).disconnect();
    }
  }
}

// Export a singleton instance
export const network = new NetworkService();

// Export types for consumers
export * from "./types";
export * from "./interfaces/network-provider.interface";
