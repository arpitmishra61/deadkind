export function formatPriceINR(amount) {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function padOrderNum(n) {
  return String(n).padStart(2, "0");
}
