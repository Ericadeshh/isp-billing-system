import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    const customer = await convex.query(
      api.customers.queries.getCustomerByPhone,
      { phone },
    );

    return NextResponse.json({
      success: true,
      customer: customer
        ? {
            id: customer._id,
            phone: customer.phone,
            name: customer.name,
            status: customer.status,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
