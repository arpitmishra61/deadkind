import { getAdminDb, isFirebaseAdminConfigured } from "../firebaseAdmin";
import { MOCK_CATEGORIES, warnMockData } from "../mockData";
import { serializeDoc } from "./serialize";

export async function getCategories() {
  if (!isFirebaseAdminConfigured()) {
    warnMockData("categories");
    return [{ id: "all", name: "ALL PRODUCTS" }, ...MOCK_CATEGORIES];
  }

  const db = getAdminDb();
  const snap = await db.collection("categories").get();
  const categories = snap.docs.map(serializeDoc);
  return [{ id: "all", name: "ALL PRODUCTS" }, ...categories];
}
