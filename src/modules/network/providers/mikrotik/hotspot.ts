import { MikroTikClient } from "./client";
import { UserCredentials, Plan, UsageData } from "../../types";
import { generateHotspotPassword } from "../../utils/password-generator";

export class HotspotManager {
  private client: MikroTikClient;

  constructor(client: MikroTikClient) {
    this.client = client;
  }

  /**
   * Create a new hotspot user
   */
  async createUser(phone: string, plan: Plan): Promise<UserCredentials> {
    const password = generateHotspotPassword();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    const comment = JSON.stringify({
      plan: plan.name,
      expires: expiresAt.toISOString(),
      phone,
      created: new Date().toISOString(),
    });

    try {
      await this.client.write("/ip/hotspot/user/add", {
        name: phone,
        password: password,
        profile: `${plan.speed}-Profile`,
        comment,
        "limit-uptime": `${plan.duration}d`,
      });

      console.log(`✅ Hotspot user created: ${phone}`);

      return {
        username: phone,
        password,
        hotspotIp: await this.getAssignedIp(phone),
      };
    } catch (error) {
      console.error(`❌ Failed to create hotspot user ${phone}:`, error);
      throw error;
    }
  }

  /**
   * Disable/remove hotspot user
   */
  async disableUser(username: string): Promise<boolean> {
    try {
      // Find user ID
      const users = await this.client.read("/ip/hotspot/user", {
        name: username,
      });

      if (users.length === 0) {
        console.log(`User ${username} not found in hotspot`);
        return false;
      }

      const userId = users[0][".id"];

      // Instead of removing, we can comment them as disabled
      await this.client.write("/ip/hotspot/user/set", {
        ".id": userId,
        comment: JSON.stringify({
          ...JSON.parse(users[0].comment || "{}"),
          disabled: true,
          disabledAt: new Date().toISOString(),
        }),
        "limit-uptime": "0s", // Immediate disconnect
      });

      console.log(`✅ Hotspot user disabled: ${username}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to disable hotspot user ${username}:`, error);
      return false;
    }
  }

  /**
   * Get user's IP address (if active)
   */
  async getAssignedIp(username: string): Promise<string | undefined> {
    try {
      const activeUsers = await this.client.read("/ip/hotspot/active", {
        user: username,
      });
      return activeUsers[0]?.address;
    } catch {
      return undefined;
    }
  }

  /**
   * Get user's usage data
   */
  async getUserUsage(username: string): Promise<UsageData | null> {
    try {
      const users = await this.client.read("/ip/hotspot/user", {
        name: username,
      });

      if (users.length === 0) return null;

      const user = users[0];
      const bytesIn = parseInt(user["bytes-in"] || "0");
      const bytesOut = parseInt(user["bytes-out"] || "0");

      return {
        bytesIn,
        bytesOut,
        uptime: user["uptime"] || "0s",
        dataUsedGB: (bytesIn + bytesOut) / (1024 * 1024 * 1024), // Convert to GB
      };
    } catch (error) {
      console.error(`❌ Failed to get usage for ${username}:`, error);
      return null;
    }
  }

  /**
   * Create multiple users (bulk operation)
   */
  async createManyUsers(
    users: Array<{ phone: string; plan: Plan }>,
  ): Promise<UserCredentials[]> {
    const results: UserCredentials[] = [];

    for (const user of users) {
      try {
        const creds = await this.createUser(user.phone, user.plan);
        results.push(creds);
        // Small delay to avoid overwhelming the router
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to create user ${user.phone}:`, error);
      }
    }

    return results;
  }

  /**
   * Check if user exists and is active
   */
  async checkUserStatus(username: string): Promise<boolean> {
    try {
      const users = await this.client.read("/ip/hotspot/user", {
        name: username,
      });
      return users.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get all active users
   */
  async getActiveUsers(): Promise<string[]> {
    try {
      const active = await this.client.read("/ip/hotspot/active");
      return active.map((a: any) => a.user);
    } catch {
      return [];
    }
  }
}
