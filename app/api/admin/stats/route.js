import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { MOCK_PRODUCTS } from "@/lib/mockData";

export async function GET(request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    const active = MOCK_PRODUCTS.filter((p) => !p.isArchived);
    return NextResponse.json({
      totalProducts: MOCK_PRODUCTS.length,
      activeProducts: active.length,
      archivedProducts: MOCK_PRODUCTS.length - active.length,
      totalOrders: 0,
      totalRevenue: 0,
      ordersByStatus: {},
      recentOrders: [],
      lowStockProducts: [],
      _mockData: true,
    });
  }

  try {
    const db = getAdminDb();
    const [productsSnap, ordersSnap] = await Promise.all([
      db.collection("products").get(),
      db.collection("orders").orderBy("createdAt", "desc").limit(200).get(),
    ]);

    const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const orders = ordersSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toMillis?.() ?? 0,
      };
    });

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => !p.isArchived).length;
    const archivedProducts = products.length - activeProducts;

    const totalOrders = orders.length;
    const ordersByStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const paidStatuses = ["paid", "confirmed", "shipped", "delivered"];
    const totalRevenue = orders
      .filter((o) => paidStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    const recentOrders = orders.slice(0, 5);

    const lowStockProducts = products
      .filter((p) => !p.isArchived && p.stock && Object.values(p.stock).some((v) => v < 5))
      .map((p) => ({
        id: p.id,
        name: p.name,
        lowVariants: Object.entries(p.stock)
          .filter(([, v]) => v < 5)
          .map(([k]) => k),
      }));

    return NextResponse.json({
      totalProducts,
      activeProducts,
      archivedProducts,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders,
      lowStockProducts,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
