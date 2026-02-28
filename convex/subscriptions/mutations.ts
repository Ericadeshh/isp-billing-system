import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

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
    const expiryDate = now + plan.duration * 24 * 60 * 60 * 1000;

    console.log(`📅 Creating subscription:`, {
      planName: plan.name,
      planDuration: plan.duration,
      expiryDate: new Date(expiryDate).toISOString(),
    });

    // Insert the subscription
    const subscriptionId = await ctx.db.insert("subscriptions", {
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

    return subscriptionId;
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

// Expire subscriptions - Regular mutation (can be called manually)
export const expireSubscriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    console.log(`⏰ Running expiry check at ${new Date(now).toISOString()}`);

    // Find expired active subscriptions
    const expired = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const expiredSubscriptions = expired.filter((sub) => sub.expiryDate <= now);

    console.log(
      `📊 Found ${expired.length} active subscriptions, ${expiredSubscriptions.length} expired`,
    );

    // Update each to expired
    for (const sub of expiredSubscriptions) {
      console.log(
        `🔄 Expiring subscription ${sub._id} (expired at ${new Date(sub.expiryDate).toISOString()})`,
      );
      await ctx.db.patch(sub._id, { status: "expired" });
    }

    return {
      totalActive: expired.length,
      expiredCount: expiredSubscriptions.length,
      timestamp: now,
    };
  },
});

// Internal version for cron jobs (same logic but as internalMutation)
export const expireSubscriptionsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    console.log(
      `⏰ Running internal expiry check at ${new Date(now).toISOString()}`,
    );

    // Find active subscriptions
    const activeSubs = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const expiredSubscriptions = activeSubs.filter(
      (sub) => sub.expiryDate <= now,
    );

    console.log(
      `📊 Found ${activeSubs.length} active subscriptions, ${expiredSubscriptions.length} expired`,
    );

    // Update each to expired
    for (const sub of expiredSubscriptions) {
      console.log(
        `🔄 Expiring subscription ${sub._id} (expired at ${new Date(sub.expiryDate).toISOString()})`,
      );
      await ctx.db.patch(sub._id, { status: "expired" });
    }

    return {
      totalActive: activeSubs.length,
      expiredCount: expiredSubscriptions.length,
      timestamp: now,
    };
  },
});

// Check and expire a single subscription
export const checkAndExpire = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) return { success: false, reason: "not_found" };

    const now = Date.now();
    if (now > sub.expiryDate && sub.status === "active") {
      await ctx.db.patch(args.subscriptionId, { status: "expired" });
      return { success: true, action: "expired", expiredAt: now };
    }

    return {
      success: true,
      action: "no_action",
      status: sub.status,
      daysRemaining: Math.ceil((sub.expiryDate - now) / (1000 * 60 * 60 * 24)),
    };
  },
});
