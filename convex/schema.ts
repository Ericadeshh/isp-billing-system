import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Internet plans offered
  plans: defineTable({
    name: v.string(),
    price: v.number(),
    speed: v.string(),
    duration: v.number(),
    dataCap: v.optional(v.number()),
    description: v.string(),
    isActive: v.boolean(),
  }).index("by_price", ["price"]),

  // Customers (internet users)
  customers: defineTable({
    phone: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    routerIp: v.optional(v.string()),
    macAddress: v.optional(v.string()),
    created: v.number(),
    hotspotUsername: v.optional(v.string()),
    hotspotPassword: v.optional(v.string()),
    hotspotIp: v.optional(v.string()),
    lastPaymentAmount: v.optional(v.number()),
    lastPaymentDate: v.optional(v.number()),
    lastTransactionId: v.optional(v.string()),
  })
    .index("by_phone", ["phone"])
    .index("by_hotspotUsername", ["hotspotUsername"]),

  // Active subscriptions
  subscriptions: defineTable({
    customerId: v.id("customers"),
    planId: v.id("plans"),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("suspended"),
    ),
    startDate: v.number(),
    expiryDate: v.number(),
    lastPayment: v.number(),
    nextPayment: v.number(),
    autoRenew: v.boolean(),
    mpesaTransactionId: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_expiry", ["expiryDate"]),

  // Usage tracking (optional)
  usage: defineTable({
    subscriptionId: v.id("subscriptions"),
    date: v.number(),
    dataUsed: v.number(),
    sessionTime: v.number(),
  }).index("by_subscription", ["subscriptionId"]),
});
