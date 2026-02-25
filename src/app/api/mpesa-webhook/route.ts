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

    // 4. Get or create a REAL customer
    let customerId;
    try {
      // Try to find existing customer by phone
      const existingCustomer = await convex.query(
        api.customers.queries.getCustomerByPhone,
        {
          phone: body.phone || "254700000000",
        },
      );

      if (existingCustomer) {
        customerId = existingCustomer._id;
        console.log("✅ Found existing customer:", customerId);
      } else {
        // Create new customer
        customerId = await convex.mutation(
          api.customers.mutations.registerCustomer,
          {
            name: `User-${(body.phone || "254700000000").slice(-4)}`,
            phone: body.phone || "254700000000",
            status: "active",
          },
        );
        console.log("✅ Created new customer:", customerId);
      }
    } catch (customerError) {
      console.error("❌ Customer error:", customerError);
      return NextResponse.json(
        {
          success: false,
          error:
            customerError instanceof Error
              ? customerError.message
              : "Customer operation failed",
        },
        { status: 500 },
      );
    }

    // 5. Record the payment with REAL customer ID
    try {
      const result = await convex.mutation(
        api.payments.mutations.recordPayment,
        {
          transactionId: body.transactionId || "TEST_" + Date.now(),
          amount: body.amount || 10,
          phoneNumber: body.phone || "254700000000",
          customerId: customerId, // ✅ This is now a REAL Convex ID
          planId: firstPlan._id,
          planName: firstPlan.name,
          userName: `User-${(body.phone || "254700000000").slice(-4)}`,
          status: "completed",
          paymentMethod: "M-Pesa",
          serviceType: firstPlan.duration <= 1 ? "hotspot" : "pppoe",
        },
      );

      console.log("✅ Payment recorded:", result);
      return NextResponse.json({
        success: true,
        result,
        planUsed: firstPlan.name,
        customerId: customerId,
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
