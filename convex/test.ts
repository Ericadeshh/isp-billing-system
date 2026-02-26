import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const testFullFlow = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧪 TEST: Starting full flow test");

    // 1. Create a test customer
    const customerId = await ctx.db.insert("customers", {
      phone: "254700000000",
      name: "Test User",
      status: "active",
      created: Date.now(),
    });
    console.log("✅ Created customer:", customerId);

    // 2. Get a plan
    const plans = await ctx.db.query("plans").take(1);
    const plan = plans[0];
    console.log("✅ Using plan:", plan.name);

    // 3. Create a subscription that expires in 1 minute
    const now = Date.now();
    const expiryDate = now + 60 * 1000; // 1 minute from now

    const subId = await ctx.db.insert("subscriptions", {
      customerId,
      planId: plan._id,
      status: "active",
      startDate: now,
      expiryDate,
      lastPayment: now,
      nextPayment: expiryDate,
      autoRenew: false,
      mpesaTransactionId: "TEST_" + Date.now(),
    });
    console.log("✅ Created subscription:", subId);

    return { customerId, subId, expiresIn: "1 minute" };
  },
});
