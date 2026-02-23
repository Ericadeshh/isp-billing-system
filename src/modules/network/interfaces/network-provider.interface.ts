import { User, UserCredentials, Plan, UsageData } from "../types";

/**
 * All network providers (MikroTik, FreeRADIUS, etc.) must implement this interface
 * This makes switching providers easy - just create a new provider class!
 */
export interface NetworkProvider {
  // User management
  createUser(phone: string, plan: Plan): Promise<UserCredentials>;
  disableUser(username: string): Promise<boolean>;
  checkUserStatus(username: string): Promise<boolean>;

  // Usage tracking
  getUserUsage(username: string): Promise<UsageData | null>;

  // Bulk operations (for migrations)
  createManyUsers(
    users: Array<{ phone: string; plan: Plan }>,
  ): Promise<UserCredentials[]>;
  disableExpiredUsers(expiryDate: number): Promise<number>;
}

export type ProviderType = "mikrotik" | "radius" | "mock";
