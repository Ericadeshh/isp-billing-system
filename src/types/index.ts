import { Id } from "../../convex/_generated/dataModel";

export interface Plan {
  _id: Id<"plans">;
  name: string;
  price: number;
  speed: string;
  duration: number;
  dataCap?: number;
  description: string;
  isActive: boolean;
}

export interface Customer {
  _id: Id<"customers">;
  phone: string;
  name: string;
  email?: string;
  address?: string;
  routerIp?: string;
  macAddress?: string;
  created: number;
}

export interface Subscription {
  _id: Id<"subscriptions">;
  customerId: Id<"customers">;
  planId: Id<"plans">;
  status: "active" | "expired" | "suspended";
  startDate: number;
  expiryDate: number;
  lastPayment: number;
  nextPayment: number;
  autoRenew: boolean;
  mpesaTransactionId?: string;
}
