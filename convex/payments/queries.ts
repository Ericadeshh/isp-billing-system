import { query } from "../_generated/server";
import { v } from "convex/values";

export const getAllPayments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("payments").order("desc").take(100);
  },
});

export const getPaymentStats = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    return {
      totalRevenue: payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0),
      todayRevenue: payments
        .filter(
          (p) => p.status === "completed" && p.createdAt >= todayTimestamp,
        )
        .reduce((sum, p) => sum + p.amount, 0),
    };
  },
});

export const getPaymentsByDate = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate),
        ),
      )
      .order("desc")
      .collect();
  },
});

export const getPaymentsByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
  },
});

export const getPaymentsByStatus = query({
  args: {
    status: v.union(
      v.literal("completed"),
      v.literal("pending"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const getRecentPayments = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db.query("payments").order("desc").take(limit);
  },
});
