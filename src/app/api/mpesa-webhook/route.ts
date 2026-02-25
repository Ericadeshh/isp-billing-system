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

    // Step 1: Get all plans
    console.log(`🔍 Fetching all plans to find match for amount: ${amount}`);
    const allPlans = await convex.query(api.plans.queries.getAllPlans);

    // Find plan that matches the amount
    const plan = allPlans.find((p) => p.price === Number(amount));

    if (!plan) {
      console.error(`❌ No plan found for amount: ${amount}`);
      return NextResponse.json(
        { success: false, error: "Plan not found for this amount" },
        { status: 404 },
      );
    }

    console.log(`✅ Plan resolved: ${plan.name} (ID: ${plan._id})`);

    // Step 2: Check if customer exists, create if not
    let finalCustomerId = customerId;

    if (!finalCustomerId) {
      console.log(
        `👤 No customerId provided, checking if customer exists with phone: ${phone}`,
      );

      // Try to find existing customer by phone
      const existingCustomer = await convex.query(
        api.customers.queries.getCustomerByPhone,
        { phone },
      );

      if (existingCustomer) {
        finalCustomerId = existingCustomer._id;
        console.log(`✅ Found existing customer: ${finalCustomerId}`);
      } else {
        // Create new customer WITHOUT status field
        console.log(`🆕 Creating new customer for phone: ${phone}`);
        finalCustomerId = await convex.mutation(
          api.customers.mutations.registerCustomer,
          {
            name: `User-${phone.slice(-4)}`,
            phone: phone,
            // Remove status from here - it will default to "active" in the mutation
          },
        );
        console.log(`✅ Created new customer with ID: ${finalCustomerId}`);
      }
    }

    // Step 3: Record the payment
    console.log(`💾 Recording payment for transaction: ${transactionId}`);
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
    console.log(`✅ Payment recorded: ${transactionId}`);

    // Step 4: If payment successful, create subscription
    if (status === "success") {
      console.log(`📝 Creating subscription for customer: ${finalCustomerId}`);
      await convex.mutation(api.subscriptions.mutations.createSubscription, {
        customerId: finalCustomerId,
        planId: plan._id,
        mpesaTransactionId: transactionId,
        autoRenew: plan.duration > 1,
      });
      console.log(`✅ Subscription created for customer: ${finalCustomerId}`);
    }

    return NextResponse.json({
      success: true,
      planName: plan.name,
      planId: plan._id,
      customerId: finalCustomerId,
      message: "Payment processed successfully",
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
