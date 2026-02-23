import { RouterOSAPI } from "node-routeros-altostrat";
import { MikroTikConfig } from "../../types";

export class MikroTikClient {
  private config: MikroTikConfig;
  private connection: any = null;

  constructor(config: MikroTikConfig) {
    this.config = config;
  }

  async connect() {
    if (this.connection) return this.connection;

    const conn = new RouterOSAPI({
      host: this.config.host,
      user: this.config.user,
      password: this.config.password,
      port: this.config.port || 8728,
    });

    try {
      await conn.connect();
      this.connection = conn;
      console.log("✅ Connected to MikroTik router");
      return this.connection;
    } catch (error) {
      // Handle unknown error type properly
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Failed to connect to MikroTik:", errorMessage);
      throw new Error(`MikroTik connection failed: ${errorMessage}`);
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async executeCommand(
    command: string[],
    params: string[] = [],
  ): Promise<any[]> {
    const conn = await this.connect();
    try {
      return await conn.write(command, params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Command failed: ${command.join("/")}`, errorMessage);
      throw error;
    }
  }

  // Helper for writing configurations
  async write(path: string, params: Record<string, string>) {
    const conn = await this.connect();
    const command = path.split("/");
    const formattedParams = Object.entries(params).map(
      ([key, value]) => `=${key}=${value}`,
    );
    return await conn.write(command, formattedParams);
  }

  // Helper for reading data
  async read(path: string, query: Record<string, string> = {}) {
    const conn = await this.connect();
    const command = path.split("/");
    const formattedQuery = Object.entries(query).map(
      ([key, value]) => `?${key}=${value}`,
    );
    return await conn.write(command.concat("print"), formattedQuery);
  }

  // Helper for removing items
  async remove(path: string, id: string) {
    const conn = await this.connect();
    const command = path.split("/");
    return await conn.write(command.concat("remove"), [`=.id=${id}`]);
  }
}
