import { getAdminDb, isFirebaseAdminConfigured } from "../firebaseAdmin";
import { MOCK_SUBCATEGORIES, warnMockData } from "../mockData";
import { serializeDoc } from "./serialize";

export async function getSubcategories(categoryId) {
  if (!isFirebaseAdminConfigured()) {
    warnMockData("subcategories");
    if (categoryId && categoryId !== "all") {
      return MOCK_SUBCATEGORIES.filter((s) => s.categoryId === categoryId);
    }
    return MOCK_SUBCATEGORIES;
  }

  const db = getAdminDb();
  let query = db.collection("subcategories");
  if (categoryId && categoryId !== "all") {
    query = query.where("categoryId", "==", categoryId);
  }
  const snap = await query.get();
  return snap.docs.map(serializeDoc);
}

export async function findSubcategoryByName(name) {
  const subcategories = await getSubcategories();
  const target = (name || "").toUpperCase().trim();
  return subcategories.find((s) => (s.name || "").toUpperCase().trim() === target) || null;
}
