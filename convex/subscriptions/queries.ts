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
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Get expiring soon subscriptions - FIXED VERSION
export const getExpiringSubscriptions = query({
  args: { daysThreshold: v.number() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const threshold = now + args.daysThreshold * 24 * 60 * 60 * 1000;

    console.log(
      `🔍 Checking for subscriptions expiring in next ${args.daysThreshold} days`,
    );
    console.log(`   Now: ${new Date(now).toISOString()}`);
    console.log(`   Threshold: ${new Date(threshold).toISOString()}`);

    // Get all active subscriptions first
    const activeSubs = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filter for those expiring within threshold
    const expiringSoon = activeSubs.filter(
      (sub) => sub.expiryDate > now && sub.expiryDate <= threshold,
    );

    console.log(`   Found ${expiringSoon.length} subscriptions expiring soon`);

    // Enrich with customer data
    const enriched = await Promise.all(
      expiringSoon.map(async (sub) => {
        const customer = await ctx.db.get(sub.customerId);
        return {
          ...sub,
          customer,
        };
      }),
    );

    return enriched;
  },
});

// Get subscription by ID
export const getSubscriptionById = query({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.subscriptionId);
  },
});

// Get all subscriptions with customer and plan details
export const getAllSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .order("desc")
      .collect();

    // Enrich with customer and plan data
    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const customer = await ctx.db.get(sub.customerId);
        const plan = await ctx.db.get(sub.planId);
        return {
          ...sub,
          customer,
          plan,
        };
      }),
    );

    return enriched;
  },
});
