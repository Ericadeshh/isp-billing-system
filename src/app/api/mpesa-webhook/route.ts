import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

// Initialize Convex client outside the handler for reuse
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Explicitly name the handler for POST requests
export async function POST(request: Request) {
  const startTime = Date.now();
  console.log(`📨 [${new Date().toISOString()}] Webhook POST received`);

  try {
    // 1. Parse and log the raw body first
    const rawBody = await request.text();
    console.log(`Raw body: ${rawBody}`);

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error("❌ Failed to parse JSON body:", e);
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 },
      );
    }

    console.log("Parsed body:", body);

    // 2. Destructure with defaults
    const {
      transactionId = "unknown",
      amount = 0,
      phone = "unknown",
      planId = "unknown",
      customerId = "unknown",
      status = "failed",
    } = body;

    // 3. Validate essential fields
    const missingFields = [];
    if (!body.transactionId) missingFields.push("transactionId");
    if (!body.amount) missingFields.push("amount");
    if (!body.phone) missingFields.push("phone");
    if (!body.planId) missingFields.push("planId");
    if (!body.customerId) missingFields.push("customerId");

    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(", ")}`);
      return NextResponse.json(
        {
          success: false,
          error: `Missing fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // 4. Dynamically import API to avoid potential circular dependencies
    const { api } = await import("../../../../convex/_generated/api");

    // 5. Get plan details
    console.log(`🔍 Fetching plan: ${planId}`);
    let plan;
    try {
      plan = await convex.query(api.plans.queries.getPlan, { planId });
    } catch (queryError) {
      console.error(`❌ Convex query failed for plan ${planId}:`, queryError);
      return NextResponse.json(
        { success: false, error: "Failed to query plan" },
        { status: 500 },
      );
    }

    if (!plan) {
      console.error(`❌ Plan not found in database: ${planId}`);
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 },
      );
    }
    console.log(`✅ Plan found: ${plan.name}`);

    // 6. Record payment
    console.log(`💾 Recording payment for transaction: ${transactionId}`);
    try {
      await convex.mutation(api.payments.mutations.recordPayment, {
        transactionId,
        amount: Number(amount),
        phoneNumber: phone,
        customerId,
        planId,
        planName: plan.name,
        userName: `User-${phone.slice(-4)}`,
        status: status === "success" ? "completed" : "failed",
        paymentMethod: "M-Pesa",
        serviceType: plan.duration <= 1 ? "hotspot" : "pppoe",
      });
      console.log(`✅ Payment recorded: ${transactionId}`);
    } catch (paymentError) {
      console.error(`❌ Failed to record payment:`, paymentError);
      // Continue? Or fail? Let's try to continue to subscription
    }

    // 7. If successful, create subscription
    if (status === "success") {
      console.log(`📝 Creating subscription for customer: ${customerId}`);
      try {
        await convex.mutation(api.subscriptions.mutations.createSubscription, {
          customerId,
          planId,
          mpesaTransactionId: transactionId,
          autoRenew: plan.duration > 1,
        });
        console.log(`✅ Subscription created for customer: ${customerId}`);
      } catch (subError) {
        console.error(`❌ Failed to create subscription:`, subError);
        return NextResponse.json(
          { success: false, error: "Payment recorded but subscription failed" },
          { status: 500 },
        );
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Webhook processed successfully in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      planName: plan.name,
      duration: `${duration}ms`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${duration}ms] Unhandled webhook error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Optional: Handle other methods explicitly (good practice)
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}
