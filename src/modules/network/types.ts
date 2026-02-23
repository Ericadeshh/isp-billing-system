export interface Plan {
  name: string;
  speed: string;
  duration: number; // days
  price: number;
  dataCap?: number;
}

export interface UserCredentials {
  username: string;
  password: string;
  hotspotIp?: string;
  server?: string;
}

export interface User {
  phone: string;
  credentials?: UserCredentials;
  plan: Plan;
  createdAt: number;
  expiresAt: number;
  status: "active" | "expired" | "suspended";
}

export interface UsageData {
  bytesIn: number;
  bytesOut: number;
  uptime: string;
  lastSeen?: Date;
  dataUsedGB?: number;
}

export interface NetworkConfig {
  provider: "mikrotik" | "radius";
  host: string;
  port: number;
  username: string;
  password: string;
  useSSL?: boolean;
}

// Environment variables type
export interface MikroTikConfig {
  host: string;
  user: string;
  password: string;
  port: number;
  apiPort?: number;
}
