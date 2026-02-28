import { query } from "../_generated/server";
import { v } from "convex/values";

// Get customer by phone
export const getCustomerByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
  },
});

// Get all customers
export const getAllCustomers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("customers").order("desc").collect();
  },
});

// Get customer with active subscription
export const getCustomerWithSubscription = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) return null;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return { customer, subscription };
  },
});

// Get customer by hotspot username
export const getCustomerByHotspotUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_hotspotUsername", (q) =>
        q.eq("hotspotUsername", args.username),
      )
      .first();
  },
});

// Get customers by status
export const getCustomersByStatus = query({
  args: {
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get customers by plan type
export const getCustomersByPlanType = query({
  args: { planType: v.union(v.literal("hotspot"), v.literal("pppoe")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("planType"), args.planType))
      .collect();
  },
});

// Get customer by ID
export const getCustomerById = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.customerId);
  },
});
