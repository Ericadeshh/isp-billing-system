import { mutation } from "./_generated/server";

export const clearPlans = mutation({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db.query("plans").collect();
    for (const plan of plans) {
      await ctx.db.delete(plan._id);
    }
    return { cleared: plans.length };
  },
});

export const clearCustomers = mutation({
  args: {},
  handler: async (ctx) => {
    const customers = await ctx.db.query("customers").collect();
    for (const customer of customers) {
      await ctx.db.delete(customer._id);
    }
    return { cleared: customers.length };
  },
});

export const clearSubscriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const subs = await ctx.db.query("subscriptions").collect();
    for (const sub of subs) {
      await ctx.db.delete(sub._id);
    }
    return { cleared: subs.length };
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear in correct order (subscriptions first, then customers, then plans)
    const subs = await ctx.db.query("subscriptions").collect();
    for (const sub of subs) {
      await ctx.db.delete(sub._id);
    }

    const customers = await ctx.db.query("customers").collect();
    for (const customer of customers) {
      await ctx.db.delete(customer._id);
    }

    const plans = await ctx.db.query("plans").collect();
    for (const plan of plans) {
      await ctx.db.delete(plan._id);
    }

    return {
      subscriptionsCleared: subs.length,
      customersCleared: customers.length,
      plansCleared: plans.length,
    };
  },
});
