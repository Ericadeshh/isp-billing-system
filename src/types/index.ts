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
  planType?: "hotspot" | "pppoe";
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
  status?: "active" | "inactive" | "suspended";
  planType?: "hotspot" | "pppoe";
  hotspotUsername?: string;
  hotspotPassword?: string;
  hotspotIp?: string;
  lastPaymentAmount?: number;
  lastPaymentDate?: number;
  lastTransactionId?: string;
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

export interface Payment {
  _id: Id<"payments">;
  transactionId: string;
  amount: number;
  phoneNumber: string;
  customerId?: Id<"customers">;
  planId?: Id<"plans">;
  planName?: string;
  userName?: string;
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
  serviceType: "hotspot" | "pppoe";
  createdAt: number;
  updatedAt?: number;
  metadata?: any;
}

export interface DashboardStats {
  totalCustomers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  todayRevenue: number;
  recentPayments: Payment[];
  expiringSoon: (Subscription & { customer?: Customer; plan?: Plan })[];
  revenueByDay: { date: string; amount: number }[];
  popularPlans: { planName: string; count: number; revenue: number }[];
}
