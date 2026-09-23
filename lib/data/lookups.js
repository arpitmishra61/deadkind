import { getAdminDb, isFirebaseAdminConfigured } from "../firebaseAdmin";
import { MOCK_COLOURS, MOCK_SIZES, warnMockData } from "../mockData";

// id -> name
export async function getSizes() {
  if (!isFirebaseAdminConfigured()) {
    warnMockData("sizes");
    return MOCK_SIZES;
  }

  const db = getAdminDb();
  const snap = await db.collection("sizes").get();
  const map = {};
  snap.docs.forEach((doc) => {
    map[doc.id] = doc.data().name;
  });
  return map;
}

// id -> { name, hex }
export async function getColours() {
  if (!isFirebaseAdminConfigured()) {
    warnMockData("colours");
    return MOCK_COLOURS;
  }

  const db = getAdminDb();
  const snap = await db.collection("colours").get();
  const map = {};
  snap.docs.forEach((doc) => {
    const data = doc.data();
    map[doc.id] = { name: data.name, hex: data.hex };
  });
  return map;
}
