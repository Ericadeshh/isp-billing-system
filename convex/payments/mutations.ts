import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const recordPayment = mutation({
  args: {
    transactionId: v.string(),
    amount: v.number(),
    phoneNumber: v.string(),
    customerId: v.optional(v.id("customers")),
    planId: v.optional(v.id("plans")),
    planName: v.optional(v.string()),
    userName: v.optional(v.string()),
    status: v.union(
      v.literal("completed"),
      v.literal("pending"),
      v.literal("failed"),
    ),
    paymentMethod: v.string(),
    serviceType: v.union(v.literal("hotspot"), v.literal("pppoe")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("payments", {
      ...args,
      createdAt: now,
    });
  },
});

export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("completed"),
      v.literal("pending"),
      v.literal("failed"),
    ),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { paymentId, ...updates } = args;
    await ctx.db.patch(paymentId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
