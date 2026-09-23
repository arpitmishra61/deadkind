import ShopFooter from "@/components/shop/ShopFooter";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data/orders";
import { getUserProfile } from "@/lib/data/users";
import AuthForms from "./AuthForms";
import ProfileView from "./ProfileView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dead'Kind — Profile",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <AuthForms />
        <ShopFooter />
      </>
    );
  }

  const profile = await getUserProfile(user.uid);
  const orders = await getOrdersForUser({ email: user.email, phone: profile?.phone || null });
  const stats = {
    orders: orders.length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    inTransit: orders.filter((o) => ["shipped", "confirmed", "paid"].includes(o.status)).length,
  };

  return (
    <>
      <ProfileView user={{ email: user.email, uid: user.uid }} profile={profile} orders={orders} stats={stats} />
      <ShopFooter />
    </>
  );
}
