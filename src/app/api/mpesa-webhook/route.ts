import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  console.log(`📨 [${new Date().toISOString()}] Webhook POST received`);

  try {
    const body = await request.json();
    console.log("📦 Webhook body:", body);

    const { transactionId, amount, phone, planCode, customerId, status } = body;

    // Validate required fields
    const missingFields = [];
    if (!transactionId) missingFields.push("transactionId");
    if (!amount) missingFields.push("amount");
    if (!phone) missingFields.push("phone");
    if (!planCode) missingFields.push("planCode");
    if (!status) missingFields.push("status");

    // Customer ID is required for real payments
    if (!customerId && !transactionId.startsWith("TEST_")) {
      missingFields.push("customerId");
    }

    if (missingFields.length > 0) {
      console.error(`❌ Missing fields: ${missingFields.join(", ")}`);
      return NextResponse.json(
        {
          success: false,
          error: `Missing fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Import Convex API
    const { api } = await import("../../../../convex/_generated/api");

    // Get all plans
    console.log(`🔍 Fetching all plans to find match for amount: ${amount}`);
    const allPlans = await convex.query(api.plans.queries.getAllPlans);

    // Find plan that matches the amount
    const plan = allPlans.find((p) => p.price === Number(amount));

    if (!plan) {
      console.error(`❌ No plan found for amount: ${amount}`);
      console.log(
        "Available plans:",
        allPlans.map((p) => ({ name: p.name, price: p.price })),
      );
      return NextResponse.json(
        { success: false, error: "Plan not found for this amount" },
        { status: 404 },
      );
    }

    console.log(`✅ Plan resolved: ${plan.name} (ID: ${plan._id})`);

    // For test transactions, still return success but log that it's a test
    if (transactionId.startsWith("TEST_")) {
      console.log("🧪 Test transaction detected - skipping database writes");
      return NextResponse.json({
        success: true,
        planName: plan.name,
        planId: plan._id,
        message: "Test webhook processed successfully (no database changes)",
      });
    }

    // For REAL transactions, ALWAYS record the payment
    console.log(`💾 Recording REAL payment for transaction: ${transactionId}`);

    // Step 1: Record the payment
    await convex.mutation(api.payments.mutations.recordPayment, {
      transactionId,
      amount: Number(amount),
      phoneNumber: phone,
      customerId,
      planId: plan._id,
      planName: plan.name,
      userName: `User-${phone.slice(-4)}`,
      status: status === "success" ? "completed" : "failed",
      paymentMethod: "M-Pesa",
      serviceType: plan.duration <= 1 ? "hotspot" : "pppoe",
    });
    console.log(`✅ Payment recorded: ${transactionId}`);

    // Step 2: If payment successful, create subscription
    if (status === "success") {
      console.log(`📝 Creating subscription for customer: ${customerId}`);
      await convex.mutation(api.subscriptions.mutations.createSubscription, {
        customerId,
        planId: plan._id,
        mpesaTransactionId: transactionId,
        autoRenew: plan.duration > 1,
      });
      console.log(`✅ Subscription created for customer: ${customerId}`);
    }

    return NextResponse.json({
      success: true,
      planName: plan.name,
      planId: plan._id,
      message: "Real payment processed successfully",
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Handle GET requests
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}
