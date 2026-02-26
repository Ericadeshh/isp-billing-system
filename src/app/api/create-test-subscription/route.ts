import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { phone, duration } = await request.json();

    // 1. Get or create a test customer
    let customerId;
    const existingCustomer = await convex.query(
      api.customers.queries.getCustomerByPhone,
      { phone },
    );

    if (existingCustomer) {
      customerId = existingCustomer._id;
    } else {
      customerId = await convex.mutation(
        api.customers.mutations.registerCustomer,
        {
          name: `Test-User-${phone.slice(-4)}`,
          phone: phone,
          status: "active",
        },
      );
    }

    // 2. Get a plan (use first available plan)
    const plans = await convex.query(api.plans.queries.getAllPlans);
    const plan = plans[0];

    // 3. Create subscription with custom duration (in minutes)
    const now = Date.now();
    const expiryDate = now + duration * 60 * 1000;

    const subscriptionId = await convex.mutation(
      api.subscriptions.mutations.createSubscription,
      {
        customerId,
        planId: plan._id,
        mpesaTransactionId: `TEST_${Date.now()}`,
        autoRenew: false,
      },
    );

    return NextResponse.json({
      success: true,
      subscriptionId,
      customerId,
      expiresIn: `${duration} minutes`,
      expiryDate: new Date(expiryDate).toISOString(),
    });
  } catch (error) {
    console.error("Test subscription error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
