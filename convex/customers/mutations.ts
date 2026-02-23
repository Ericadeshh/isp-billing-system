import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const registerCustomer = mutation({
  args: {
    phone: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    routerIp: v.optional(v.string()),
    macAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if customer already exists
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (existing) {
      throw new Error("Customer already exists");
    }

    return await ctx.db.insert("customers", {
      ...args,
      created: Date.now(),
    });
  },
});

export const updateCustomer = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    routerIp: v.optional(v.string()),
    macAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { customerId, ...updates } = args;
    await ctx.db.patch(customerId, updates);
    return customerId;
  },
});

export const recordPayment = mutation({
  args: {
    customerId: v.id("customers"),
    amount: v.number(),
    transactionId: v.string(),
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const { customerId, amount, transactionId, planId } = args;

    // Get customer
    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }

    // Get plan
    const plan = await ctx.db.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    // Create subscription
    const now = Date.now();
    const expiryDate = now + plan.duration * 24 * 60 * 60 * 1000;

    const subscriptionId = await ctx.db.insert("subscriptions", {
      customerId,
      planId,
      status: "active",
      startDate: now,
      expiryDate,
      lastPayment: now,
      nextPayment: expiryDate,
      autoRenew: true,
      mpesaTransactionId: transactionId,
    });

    // Update customer with last payment info
    await ctx.db.patch(customerId, {
      lastPaymentAmount: amount,
      lastPaymentDate: now,
      lastTransactionId: transactionId,
    });

    return {
      subscriptionId,
      expiryDate,
    };
  },
});
