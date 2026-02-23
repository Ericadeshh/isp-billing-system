import { mutation } from "./_generated/server";

export const seedPlans = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if plans already exist
    const existingPlans = await ctx.db.query("plans").take(1);
    if (existingPlans.length > 0) {
      console.log("✅ Plans already exist in database");
      return { message: "Plans already exist", count: existingPlans.length };
    }

    const plans = [
      {
        name: "1 Hour Pass",
        price: 10,
        speed: "5 Mbps",
        duration: 1 / 24, // 1 hour in days
        description: "Perfect for quick browsing and checking emails",
        isActive: true,
      },
      {
        name: "3 Hours Pass",
        price: 25,
        speed: "5 Mbps",
        duration: 3 / 24,
        description: "Ideal for a movie or extended browsing session",
        isActive: true,
      },
      {
        name: "6 Hours Pass",
        price: 45,
        speed: "10 Mbps",
        duration: 6 / 24,
        description: "Great for work or study sessions",
        isActive: true,
      },
      {
        name: "24 Hours Pass",
        price: 80,
        speed: "10 Mbps",
        duration: 1,
        description: "Full day of unlimited browsing",
        isActive: true,
      },
      {
        name: "Weekly Pass",
        price: 350,
        speed: "15 Mbps",
        duration: 7,
        description: "Best value for regular users",
        isActive: true,
      },
      {
        name: "Monthly Pass",
        price: 1000,
        speed: "20 Mbps",
        duration: 30,
        description: "Unlimited internet for a month",
        isActive: true,
      },
    ];

    for (const plan of plans) {
      await ctx.db.insert("plans", plan);
    }

    console.log(`✅ Seeded ${plans.length} internet plans successfully`);
    return { message: "Plans seeded successfully", count: plans.length };
  },
});
