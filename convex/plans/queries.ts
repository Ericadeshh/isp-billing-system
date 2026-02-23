import { query } from "../_generated/server";
import { v } from "convex/values";

// Get all active plans
export const getAllPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("plans")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get a specific plan
export const getPlan = query({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.planId);
  },
});

// Get plans by price range
export const getPlansByPrice = query({
  args: {
    minPrice: v.number(),
    maxPrice: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plans")
      .filter((q) =>
        q.and(
          q.gte(q.field("price"), args.minPrice),
          q.lte(q.field("price"), args.maxPrice),
        ),
      )
      .collect();
  },
});
