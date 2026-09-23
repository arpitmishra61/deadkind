import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data/orders";
import { getUserProfile } from "@/lib/data/users";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const profile = await getUserProfile(user.uid);
    const orders = await getOrdersForUser({ email: user.email, phone: profile?.phone || null });
    const stats = {
      orders: orders.length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      inTransit: orders.filter((o) => ["shipped", "confirmed", "paid"].includes(o.status)).length,
    };
    return NextResponse.json({ orders, stats, profile });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
