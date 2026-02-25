import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📨 M-Pesa webhook received:", body);

    const { transactionId, amount, phone, planId, customerId, status } = body;

    // Validate required fields
    if (
      !transactionId ||
      !amount ||
      !phone ||
      !planId ||
      !customerId ||
      !status
    ) {
      console.error("❌ Missing required fields:", {
        transactionId,
        amount,
        phone,
        planId,
        customerId,
        status,
      });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get plan details
    const plan = await convex.query(api.plans.queries.getPlan, { planId });

    if (!plan) {
      console.error(`❌ Plan not found: ${planId}`);
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 },
      );
    }

    // Record payment in database
    await convex.mutation(api.payments.mutations.recordPayment, {
      transactionId,
      amount,
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

    // If payment successful, create subscription
    if (status === "success") {
      await convex.mutation(api.subscriptions.mutations.createSubscription, {
        customerId,
        planId,
        mpesaTransactionId: transactionId,
        autoRenew: plan.duration > 1, // Auto-renew only for PPPoE
      });

      console.log(`✅ Subscription created for customer: ${customerId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
