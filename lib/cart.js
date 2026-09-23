// Single owner of the sessionStorage cart schema, shared by every page that
// reads or mutates the cart (cart, product, collection). Mirrors the original
// site's shape exactly so nothing about the checkout/summary math changes.

const CART_KEY = "dk_cart";
export const CART_CHANGED_EVENT = "dk-cart-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

function lineKey(item) {
  return [item.id, item.size, item.colour].join("::");
}

export function getCart() {
  if (!isBrowser()) return [];
  try {
    const raw = window.sessionStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(cart) {
  if (!isBrowser()) return cart;
  window.sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
  return cart;
}

// Bulk-replace the whole cart — used after stock/lookup enrichment, where
// every line item's colourName/sizeName/maxStock gets refreshed at once.
export function setCart(cart) {
  return persist(cart);
}

export function addToCart(product) {
  const cart = getCart();
  const key = lineKey(product);
  const existing = cart.find((item) => lineKey(item) === key);
  const maxStock = typeof product.maxStock === "number" ? product.maxStock : Infinity;

  if (existing) {
    existing.qty = Math.min(existing.qty + (product.qty || 1), maxStock);
  } else {
    cart.push({ ...product, qty: Math.min(product.qty || 1, maxStock) });
  }

  return persist(cart);
}

export function updateQty(index, delta) {
  const cart = getCart();
  const item = cart[index];
  if (!item) return cart;

  const maxStock = typeof item.maxStock === "number" ? item.maxStock : Infinity;
  item.qty = Math.min(Math.max(1, item.qty + delta), maxStock);

  return persist(cart);
}

export function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  return persist(cart);
}

export function clearCart() {
  return persist([]);
}

export function cartCount(cart = getCart()) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

export function cartTotal(cart = getCart()) {
  return cart.reduce((sum, item) => sum + item.qty * (item.price || 0), 0);
}
