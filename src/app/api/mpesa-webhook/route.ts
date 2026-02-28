import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Add CORS headers helper
function addCorsHeaders(response: NextResponse) {
  response.headers.set(
    "Access-Control-Allow-Origin",
    "https://mpesa-payment-app-navy.vercel.app",
  );
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set(
    "Access-Control-Allow-Origin",
    "https://mpesa-payment-app-navy.vercel.app",
  );
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function POST(request: Request) {
  console.log("🔥🔥🔥 WEBHOOK FIRED at:", new Date().toISOString());
  console.log("🔥 Request method:", request.method);
  console.log("🔥 Request URL:", request.url);
  console.log("🔥 Headers:", Object.fromEntries(request.headers));

  try {
    const body = await request.json();
    console.log("🔥 Body:", JSON.stringify(body, null, 2));

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
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: `Missing fields: ${missingFields.join(", ")}`,
          },
          { status: 400 },
        ),
      );
    }

    console.log(`🔍 Processing payment:`, {
      transactionId,
      amount,
      phone,
      planCode,
      status,
    });

    // Import API
    const { api } = await import("@convex/_generated/api");

    // Get all plans
    console.log(`🔍 Fetching all plans to find match for amount: ${amount}`);
    const allPlans = await convex.query(api.plans.queries.getAllPlans);
    console.log(`📋 Found ${allPlans.length} plans`);

    // Find plan that matches the amount
    const plan = allPlans.find((p) => p.price === Number(amount));

    if (!plan) {
      console.error(`❌ No plan found for amount: ${amount}`);
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: "Plan not found for this amount" },
          { status: 404 },
        ),
      );
    }

    console.log(`✅ Plan resolved: ${plan.name} (ID: ${plan._id})`);
    const serviceType = plan.duration <= 1 ? "hotspot" : "pppoe";
    console.log(`📋 Service type determined: ${serviceType}`);

    // Get or create customer with REAL phone number
    let finalCustomerId = customerId;

    if (!finalCustomerId) {
      console.log(
        `👤 No customerId provided, checking if customer exists with phone: ${phone}`,
      );

      const existingCustomer = await convex.query(
        api.customers.queries.getCustomerByPhone,
        { phone },
      );
      console.log(`🔍 Existing customer:`, existingCustomer);

      if (existingCustomer) {
        finalCustomerId = existingCustomer._id;
        console.log("✅ Found existing customer:", finalCustomerId);

        // Update the customer's planType based on the purchase
        await convex.mutation(api.customers.mutations.updateCustomer, {
          customerId: finalCustomerId,
          planType: serviceType,
        });
        console.log(`✅ Updated customer planType to ${serviceType}`);
      } else {
        console.log(`🆕 Creating new customer for phone: ${phone}`);
        finalCustomerId = await convex.mutation(
          api.customers.mutations.registerCustomer,
          {
            name: `User-${phone.slice(-4)}`,
            phone: phone,
            status: "active",
            planType: serviceType, // Set planType on creation
          },
        );
        console.log("✅ Created new customer with ID:", finalCustomerId);
      }
    }

    // Record payment
    console.log("💾 Recording payment...");
    const paymentResult = await convex.mutation(
      api.payments.mutations.recordPayment,
      {
        transactionId,
        amount: Number(amount),
        phoneNumber: phone,
        customerId: finalCustomerId,
        planId: plan._id,
        planName: plan.name,
        userName: `User-${phone.slice(-4)}`,
        status: status === "success" ? "completed" : "failed",
        paymentMethod: "M-Pesa",
        serviceType: serviceType,
      },
    );
    console.log(`✅ Payment recorded:`, paymentResult);

    // Create subscription if payment successful
    if (status === "success") {
      console.log("📝 Creating subscription...");
      const subscriptionResult = await convex.mutation(
        api.subscriptions.mutations.createSubscription,
        {
          customerId: finalCustomerId,
          planId: plan._id,
          mpesaTransactionId: transactionId,
          autoRenew: plan.duration > 1,
        },
      );
      console.log(`✅ Subscription created:`, subscriptionResult);
    }

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        customerId: finalCustomerId,
        planName: plan.name,
        message: "Webhook processed successfully",
      }),
    );
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 },
      ),
    );
  }
}

export async function GET() {
  return addCorsHeaders(
    NextResponse.json(
      { error: "Method not allowed. Use POST." },
      { status: 405 },
    ),
  );
}
