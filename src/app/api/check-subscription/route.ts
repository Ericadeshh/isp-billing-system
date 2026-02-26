import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: "Missing subscriptionId" },
        { status: 400 },
      );
    }

    // Get the subscription directly
    const subscription = await convex.query(
      api.subscriptions.queries.getSubscriptionById,
      { subscriptionId },
    );

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Calculate time remaining
    const now = Date.now();
    const timeRemaining = subscription.expiryDate - now;
    const isExpired = timeRemaining <= 0;

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription._id,
        status: subscription.status,
        expiryDate: new Date(subscription.expiryDate).toISOString(),
        timeRemaining: Math.max(0, Math.floor(timeRemaining / 1000)), // in seconds
        isExpired,
      },
    });
  } catch (error) {
    console.error("Check subscription error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
