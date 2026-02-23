import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Simple network service for now (will be replaced with actual MikroTik integration)
const networkService = {
  createUser: async (phone: string, plan: any) => {
    return {
      username: phone,
      password:
        "ISP" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      hotspotIp: "192.168.1." + Math.floor(Math.random() * 200 + 50),
    };
  },
  disableUser: async (username: string) => {
    console.log(`🔌 Disabling user: ${username}`);
    return true;
  },
  checkUserStatus: async (username: string) => true,
  getUserUsage: async (username: string) => ({
    bytesIn: Math.floor(Math.random() * 1000000000),
    bytesOut: Math.floor(Math.random() * 500000000),
    uptime: "1h 23m",
    dataUsedGB: Math.random() * 10,
  }),
};

export const activateUser = action({
  args: {
    phone: v.string(),
    planName: v.string(),
    planSpeed: v.string(),
    planDuration: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const { phone, planName, planSpeed, planDuration, price } = args;

    try {
      const credentials = await networkService.createUser(phone, {
        name: planName,
        speed: planSpeed,
        duration: planDuration,
        price,
      });

      // Use type assertion to bypass the TypeScript error
      await ctx.runMutation("customers:updateNetworkCredentials" as any, {
        phone,
        hotspotUsername: credentials.username,
        hotspotPassword: credentials.password,
        hotspotIp: credentials.hotspotIp || "",
      });

      return {
        success: true,
        username: credentials.username,
        password: credentials.password,
        hotspotIp: credentials.hotspotIp,
      };
    } catch (error) {
      console.error("❌ Network activation failed:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to activate internet",
      };
    }
  },
});

export const deactivateUser = action({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await networkService.disableUser(args.username);

      await ctx.runMutation("customers:clearNetworkCredentials" as any, {
        username: args.username,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Deactivation failed:", error);
      return { success: false };
    }
  },
});

export const checkUserStatus = action({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await networkService.checkUserStatus(args.username);
  },
});

export const getUserUsage = action({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await networkService.getUserUsage(args.username);
  },
});
