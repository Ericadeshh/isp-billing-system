import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Create new subscription after payment
export const createSubscription = mutation({
  args: {
    customerId: v.id("customers"),
    planId: v.id("plans"),
    mpesaTransactionId: v.string(),
    autoRenew: v.boolean(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new Error("Plan not found");

    const now = Date.now();
    // Use plan duration (in days) to calculate expiry
    const expiryDate = now + 2 * 60 * 1000; // 2 minutes for testing

    return await ctx.db.insert("subscriptions", {
      customerId: args.customerId,
      planId: args.planId,
      status: "active",
      startDate: now,
      expiryDate: expiryDate,
      lastPayment: now,
      nextPayment: expiryDate,
      autoRenew: args.autoRenew,
      mpesaTransactionId: args.mpesaTransactionId,
    });
  },
});

// Renew subscription
export const renewSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    mpesaTransactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) throw new Error("Subscription not found");

    const plan = await ctx.db.get(subscription.planId);
    if (!plan) throw new Error("Plan not found");

    const now = Date.now();
    const newExpiry = now + plan.duration * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.subscriptionId, {
      status: "active",
      expiryDate: newExpiry,
      lastPayment: now,
      nextPayment: newExpiry,
      mpesaTransactionId: args.mpesaTransactionId,
    });

    return args.subscriptionId;
  },
});

// Expire subscriptions (run as a cron job)
export const expireSubscriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find expired active subscriptions
    const expired = await ctx.db
      .query("subscriptions")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.lt(q.field("expiryDate"), now),
        ),
      )
      .collect();

    // Update each to expired
    for (const sub of expired) {
      await ctx.db.patch(sub._id, { status: "expired" });
    }

    return expired.length;
  },
});

// Add this simple function
export const checkAndExpire = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) return;

    const now = Date.now();
    if (now > sub.expiryDate && sub.status === "active") {
      await ctx.db.patch(args.subscriptionId, { status: "expired" });
    }
  },
});
