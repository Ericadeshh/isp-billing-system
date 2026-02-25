import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { Id } from "../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  // 1. Log EVERYTHING
  console.log("🔥🔥🔥 WEBHOOK FIRED at:", new Date().toISOString());
  console.log("🔥 Headers:", Object.fromEntries(request.headers));

  try {
    const body = await request.json();
    console.log("🔥 Body:", JSON.stringify(body, null, 2));

    // 2. Import API
    const { api } = await import("../../../../convex/_generated/api");

    // 3. First, get a real plan ID from the database
    console.log("🔥 Fetching plans...");
    const plans = await convex.query(api.plans.queries.getAllPlans);
    console.log(
      "🔥 Available plans:",
      plans.map((p) => ({ id: p._id, name: p.name, price: p.price })),
    );

    if (plans.length === 0) {
      console.log("🔥 No plans found!");
      return NextResponse.json(
        { success: false, error: "No plans in database" },
        { status: 500 },
      );
    }

    // Use the first plan
    const firstPlan = plans[0];
    console.log("🔥 Using plan:", firstPlan.name, "with ID:", firstPlan._id);

    // 4. Try to record a test payment with REAL plan ID
    try {
      const result = await convex.mutation(
        api.payments.mutations.recordPayment,
        {
          transactionId: body.transactionId || "TEST_" + Date.now(),
          amount: body.amount || 10,
          phoneNumber: body.phone || "254700000000",
          customerId: body.customerId || "test_customer",
          planId: firstPlan._id, // ✅ Using real ID from database
          planName: firstPlan.name,
          userName: "Test User",
          status: "completed",
          paymentMethod: "M-Pesa",
          serviceType: "hotspot",
        },
      );

      console.log("✅ Payment recorded:", result);
      return NextResponse.json({
        success: true,
        result,
        planUsed: firstPlan.name,
      });
    } catch (mutationError) {
      console.error("❌ Mutation error:", mutationError);
      return NextResponse.json(
        {
          success: false,
          error:
            mutationError instanceof Error
              ? mutationError.message
              : "Mutation failed",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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
