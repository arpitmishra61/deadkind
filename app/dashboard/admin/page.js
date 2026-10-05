import { cookies } from "next/headers";
import { createHash } from "crypto";
import AdminApp from "./AdminApp";

function getExpectedToken() {
  const password = process.env.ADMIN_PASSWORD || "password@123";
  return createHash("sha256").update(password + "dk-admin-2050").digest("hex");
}

export const metadata = { title: "Admin — DeadKind" };

export default async function AdminPage() {
  const store = await cookies();
  const token = store.get("__dk_admin")?.value;
  const isAuth = token === getExpectedToken();

  return <AdminApp initialAuth={isAuth} />;
}
