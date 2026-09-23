// Firestore Timestamps aren't plain JSON — convert them before a value can be
// returned from an API route or passed from a Server Component to a Client
// Component. Called on every doc that crosses that boundary.
export function serializeDoc(doc) {
  return serializeValue({ id: doc.id, ...doc.data() });
}

function serializeValue(value) {
  if (value === null || value === undefined) return value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = serializeValue(val);
    }
    return out;
  }
  return value;
}
