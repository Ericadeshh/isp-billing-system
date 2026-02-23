import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { phone, amount, transactionId, planId, customerId } =
      await request.json();

    console.log(`📨 Payment webhook received:`, {
      phone,
      amount,
      transactionId,
      planId,
      customerId,
    });

    // 1. Get plan details
    const plan = await convex.query(api.plans.queries.getPlan, { planId });

    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    // 2. Update customer payment status in database
    await convex.mutation(api.customers.mutations.recordPayment, {
      customerId,
      amount,
      transactionId,
      planId,
    });

    // 3. Activate internet on MikroTik
    const activationResult = await convex.action(
      "network:activateUser" as any,
      {
        phone,
        planName: plan.name,
        planSpeed: plan.speed,
        planDuration: plan.duration,
        price: amount,
      },
    );

    if (!activationResult.success) {
      console.error("❌ Network activation failed:", activationResult.error);
    } else {
      console.log(`✅ Network activated for ${phone}:`, {
        username: activationResult.username,
        password: activationResult.password,
      });
    }

    return NextResponse.json({
      success: true,
      networkActivated: activationResult.success,
      credentials: activationResult.success
        ? {
            username: activationResult.username,
            password: activationResult.password,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
