import { query } from "../_generated/server";
import { v } from "convex/values";

// Check if customer has active subscription
export const hasActiveSubscription = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return !!subscription;
  },
});

// Get customer's subscription history
export const getCustomerSubscriptions = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
  },
});

// Get all active subscriptions
export const getActiveSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Get expiring soon subscriptions
export const getExpiringSubscriptions = query({
  args: { daysThreshold: v.number() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const threshold = now + args.daysThreshold * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("subscriptions")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.gt(q.field("expiryDate"), now),
          q.lt(q.field("expiryDate"), threshold),
        ),
      )
      .collect();
  },
});
