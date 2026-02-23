import { MikroTikConfig } from "../../types";

/**
 * Simple MikroTik API client using REST API (RouterOS v7+)
 * Falls back to SSH commands for older versions
 */
export class SimpleMikroTikClient {
  private config: MikroTikConfig;
  private useRest: boolean;

  constructor(config: MikroTikConfig) {
    this.config = config;
    this.useRest = true; // Set to false if using older RouterOS
  }

  /**
   * Execute a command via REST API (RouterOS v7+)
   */
  private async restCommand(
    path: string,
    command: string,
    params: Record<string, any> = {},
  ) {
    const url = `http://${this.config.host}/rest/${path}/${command}`;
    const auth = Buffer.from(
      `${this.config.user}:${this.config.password}`,
    ).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`REST API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create hotspot user
   */
  async createHotspotUser(
    phone: string,
    password: string,
    profile: string,
    comment: string,
  ) {
    if (this.useRest) {
      return await this.restCommand("/ip/hotspot/user", "add", {
        name: phone,
        password,
        profile,
        comment,
      });
    } else {
      // Fallback to SSH for older RouterOS
      return await this.sshCommand(
        `/ip hotspot user add name=${phone} password=${password} profile=${profile} comment="${comment}"`,
      );
    }
  }

  /**
   * Execute SSH command (fallback for older RouterOS)
   * Note: You'll need to install 'ssh2' package for this
   */
  private async sshCommand(command: string): Promise<any> {
    // This would use ssh2 package
    // For now, throw error
    throw new Error("SSH fallback not implemented yet");
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.useRest) {
        await this.restCommand("/system/resource", "print");
      }
      return true;
    } catch {
      return false;
    }
  }
}
