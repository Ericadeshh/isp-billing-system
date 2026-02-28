import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createPlan = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    speed: v.string(),
    duration: v.number(),
    dataCap: v.optional(v.number()),
    description: v.string(),
    planType: v.union(v.literal("hotspot"), v.literal("pppoe")),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    console.log(`📦 Creating new plan:`, args.name);

    return await ctx.db.insert("plans", {
      ...args,
    });
  },
});

export const updatePlan = mutation({
  args: {
    planId: v.id("plans"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    speed: v.optional(v.string()),
    duration: v.optional(v.number()),
    dataCap: v.optional(v.number()),
    description: v.optional(v.string()),
    planType: v.optional(v.union(v.literal("hotspot"), v.literal("pppoe"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { planId, ...updates } = args;

    console.log(`📝 Updating plan:`, planId);

    await ctx.db.patch(planId, updates);
    return planId;
  },
});

export const deletePlan = mutation({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    console.log(`🗑️ Deleting plan:`, args.planId);

    await ctx.db.delete(args.planId);
    return args.planId;
  },
});

export const togglePlanStatus = mutation({
  args: {
    planId: v.id("plans"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.planId, {
      isActive: args.isActive,
    });
    return args.planId;
  },
});
