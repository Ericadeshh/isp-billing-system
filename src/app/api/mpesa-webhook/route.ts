import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  console.log("🔥🔥🔥 WEBHOOK FIRED at:", new Date().toISOString());

  try {
    const body = await request.json();
    console.log("🔥 Body:", JSON.stringify(body, null, 2));

    const { transactionId, amount, phone, planCode, customerId, status } = body;

    // Import API
    const { api } = await import("../../../../convex/_generated/api");

    // Get all plans
    const plans = await convex.query(api.plans.queries.getAllPlans);
    const plan = plans.find((p) => p.price === Number(amount || planCode));

    if (!plan) {
      console.error(`❌ No plan found for amount: ${amount}`);
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 },
      );
    }

    console.log(`✅ Plan resolved: ${plan.name}`);

    // Get or create customer with REAL phone number
    let finalCustomerId = customerId;

    if (!finalCustomerId) {
      const existingCustomer = await convex.query(
        api.customers.queries.getCustomerByPhone,
        { phone },
      );

      if (existingCustomer) {
        finalCustomerId = existingCustomer._id;
        console.log("✅ Found existing customer:", finalCustomerId);
      } else {
        // Create new customer
        finalCustomerId = await convex.mutation(
          api.customers.mutations.registerCustomer,
          {
            name: `User-${phone.slice(-4)}`,
            phone: phone,
            status: "active",
          },
        );
        console.log("✅ Created new customer:", finalCustomerId);
      }
    }

    // Record payment
    console.log("💾 Recording payment...");
    await convex.mutation(api.payments.mutations.recordPayment, {
      transactionId,
      amount: Number(amount),
      phoneNumber: phone,
      customerId: finalCustomerId,
      planId: plan._id,
      planName: plan.name,
      userName: `User-${phone.slice(-4)}`,
      status: status === "success" ? "completed" : "failed",
      paymentMethod: "M-Pesa",
      serviceType: plan.duration <= 1 ? "hotspot" : "pppoe",
    });

    // Create subscription
    if (status === "success") {
      console.log("📝 Creating subscription...");
      await convex.mutation(api.subscriptions.mutations.createSubscription, {
        customerId: finalCustomerId,
        planId: plan._id,
        mpesaTransactionId: transactionId,
        autoRenew: plan.duration > 1,
      });
    }

    return NextResponse.json({
      success: true,
      customerId: finalCustomerId,
      planName: plan.name,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}
