import { getAdminDb, isFirebaseAdminConfigured } from "../firebaseAdmin";
import { MOCK_PRODUCTS, warnMockData } from "../mockData";
import { serializeDoc } from "./serialize";

function withIsNew(product) {
  if (!product.createdAt) return product;
  const ageMs = Date.now() - new Date(product.createdAt).getTime();
  return { ...product, isNew: ageMs <= 7 * 24 * 60 * 60 * 1000 };
}

export async function getAllProducts({ subcategoryId, categoryId } = {}) {
  if (!isFirebaseAdminConfigured()) {
    warnMockData("products");
    let list = MOCK_PRODUCTS;
    if (subcategoryId) list = list.filter((p) => p.subcategoryId === subcategoryId);
    else if (categoryId) list = list.filter((p) => p.categoryId === categoryId);
    return list.map(withIsNew);
  }

  const db = getAdminDb();
  let query = db.collection("products");

  if (subcategoryId) query = query.where("subcategoryId", "==", subcategoryId);
  else if (categoryId) query = query.where("categoryId", "==", categoryId);

  const snap = await query.get();
  return snap.docs.map((doc) => withIsNew(serializeDoc(doc)));
}

export async function getProductById(id) {
  if (!isFirebaseAdminConfigured()) {
    warnMockData("products");
    const found = MOCK_PRODUCTS.find((p) => p.id === id);
    return found ? withIsNew(found) : null;
  }

  const db = getAdminDb();
  const doc = await db.collection("products").doc(id).get();
  if (!doc.exists) return null;
  return withIsNew(serializeDoc(doc));
}

// Mirrors the original fallback chain: same subcategory -> same category -> any product.
export async function getRelatedProducts(product, limitCount = 4) {
  if (!isFirebaseAdminConfigured()) {
    warnMockData("products");
    let list = MOCK_PRODUCTS.filter((p) => p.subcategoryId === product.subcategoryId);
    if (!list.length) list = MOCK_PRODUCTS.filter((p) => p.categoryId === product.categoryId);
    if (!list.length) list = MOCK_PRODUCTS;
    return list.filter((p) => p.id !== product.id).slice(0, limitCount).map(withIsNew);
  }

  const db = getAdminDb();
  const fetchCount = limitCount + 1;
  let list = [];

  if (product.subcategoryId) {
    const snap = await db
      .collection("products")
      .where("subcategoryId", "==", product.subcategoryId)
      .limit(fetchCount)
      .get();
    list = snap.docs.map(serializeDoc);
  }

  if (!list.length && product.categoryId) {
    const snap = await db
      .collection("products")
      .where("categoryId", "==", product.categoryId)
      .limit(fetchCount)
      .get();
    list = snap.docs.map(serializeDoc);
  }

  if (!list.length) {
    const snap = await db.collection("products").limit(fetchCount).get();
    list = snap.docs.map(serializeDoc);
  }

  return list.filter((p) => p.id !== product.id).slice(0, limitCount).map(withIsNew);
}

export async function getArchivedProductsBySubcategoryId(subcategoryId) {
  if (!subcategoryId) return [];

  if (!isFirebaseAdminConfigured()) {
    warnMockData("products");
    return MOCK_PRODUCTS.filter(
      (p) => p.subcategoryId === subcategoryId && (p.isArchived === true || p.archived === true)
    );
  }

  const db = getAdminDb();
  const snap = await db.collection("products").where("subcategoryId", "==", subcategoryId).get();
  return snap.docs
    .map(serializeDoc)
    .filter((p) => p.isArchived === true || p.archived === true);
}

export function getProductImage(product) {
  if (product.images?.length) return product.images[0];
  const firstGroup = Object.values(product.colourImages || {}).find((urls) => urls?.length);
  return firstGroup ? firstGroup[0] : null;
}
