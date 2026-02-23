import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const updateNetworkCredentials = internalMutation({
  args: {
    phone: v.string(),
    hotspotUsername: v.string(),
    hotspotPassword: v.string(),
    hotspotIp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find customer by phone
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (!customer) {
      throw new Error(`Customer not found with phone: ${args.phone}`);
    }

    await ctx.db.patch(customer._id, {
      hotspotUsername: args.hotspotUsername,
      hotspotPassword: args.hotspotPassword,
      hotspotIp: args.hotspotIp,
    });

    return customer._id;
  },
});

export const clearNetworkCredentials = internalMutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Find customer by hotspot username
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_hotspotUsername", (q) =>
        q.eq("hotspotUsername", args.username),
      )
      .first();

    if (!customer) {
      console.log(`No customer found with hotspot username: ${args.username}`);
      return null;
    }

    await ctx.db.patch(customer._id, {
      hotspotUsername: undefined,
      hotspotPassword: undefined,
      hotspotIp: undefined,
    });

    return customer._id;
  },
});
