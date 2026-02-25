import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Create a new internet plan
export const createPlan = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    speed: v.string(),
    duration: v.number(),
    dataCap: v.optional(v.number()),
    description: v.string(),
    planType: v.union(v.literal("hotspot"), v.literal("pppoe")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("plans", {
      ...args,
      isActive: true,
    });
  },
});

// Update an existing plan
export const updatePlan = mutation({
  args: {
    planId: v.id("plans"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    speed: v.optional(v.string()),
    duration: v.optional(v.number()),
    dataCap: v.optional(v.number()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    planType: v.optional(v.union(v.literal("hotspot"), v.literal("pppoe"))),
  },
  handler: async (ctx, args) => {
    const { planId, ...updates } = args;
    await ctx.db.patch(planId, updates);
    return planId;
  },
});

// Delete a plan
export const deletePlan = mutation({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.planId);
  },
});
