// Placeholder content served by lib/data/* when Firebase Admin isn't
// configured yet, so the UI can be previewed locally before real credentials
// and real product data exist. Images point at existing /public assets —
// they're not real product photos, just enough to prove the layout works.

export const MOCK_CATEGORIES = [{ id: "cat-apparel", name: "APPAREL" }];

export const MOCK_SUBCATEGORIES = [
  { id: "sub-bts", name: "BEYOND THE SYSTEM", categoryId: "cat-apparel" },
  { id: "sub-wiws", name: "WHAT I WANT TO SAY", categoryId: "cat-apparel" },
];

export const MOCK_SIZES = { "size-s": "S", "size-m": "M", "size-l": "L", "size-xl": "XL" };

export const MOCK_COLOURS = {
  "col-black": { name: "Black", hex: "#111111" },
  "col-pink": { name: "Pink", hex: "#c45486" },
  "col-white": { name: "White", hex: "#f2f2f2" },
};

const ALL_SIZES = Object.keys(MOCK_SIZES);
const TWO_COLOURS = ["col-black", "col-pink"];

function stockFor(colours, sizes, qty = 12) {
  const stock = {};
  colours.forEach((c) => sizes.forEach((s) => { stock[`${c}_${s}`] = qty; }));
  return stock;
}

function product(overrides) {
  return {
    comparePrice: null,
    hero: false,
    colours: TWO_COLOURS,
    sizes: ALL_SIZES,
    images: [],
    colourImages: {},
    description: "Placeholder product for local UI preview — connect Firebase to see real data.",
    material: "Cotton Blend",
    fit: "Oversized",
    createdAt: Date.now(),
    isArchived: false,
    ...overrides,
    stock: stockFor(overrides.colours || TWO_COLOURS, overrides.sizes || ALL_SIZES),
  };
}

export const MOCK_PRODUCTS = [
  product({ id: "mock-1", name: "VOID SIGNAL HOODIE", price: 2499, comparePrice: 2999, hero: true, subcategoryId: "sub-bts", categoryId: "cat-apparel", images: ["/model.png"] }),
  product({ id: "mock-2", name: "GHOST FREQUENCY TEE", price: 1299, subcategoryId: "sub-bts", categoryId: "cat-apparel", images: ["/skull.png"] }),
  product({ id: "mock-3", name: "STATIC NOISE JACKET", price: 3799, subcategoryId: "sub-bts", categoryId: "cat-apparel", images: ["/skull2.png"] }),
  product({ id: "mock-4", name: "BROKEN SIGNAL CARGO", price: 2199, subcategoryId: "sub-bts", categoryId: "cat-apparel", images: ["/skull3.png"], isArchived: true }),
  product({ id: "mock-5", name: "ANALOG DECAY TEE", price: 1399, subcategoryId: "sub-bts", categoryId: "cat-apparel", images: ["/p1.png"] }),
  product({ id: "mock-6", name: "LOST TRANSMISSION HOODIE", price: 2899, subcategoryId: "sub-bts", categoryId: "cat-apparel", images: ["/p2.png"] }),
  product({ id: "mock-7", name: "DEAD CHANNEL SHORTS", price: 1699, subcategoryId: "sub-bts", categoryId: "cat-apparel", images: ["/p3.png"] }),
  product({ id: "mock-8", name: "ORBIT DRIFT JACKET", price: 3299, hero: true, subcategoryId: "sub-bts", categoryId: "cat-apparel", images: ["/earth.png"] }),
  product({ id: "mock-9", name: "WHISPER CIRCUIT TEE", price: 1499, subcategoryId: "sub-wiws", categoryId: "cat-apparel", images: ["/planet.png"] }),
  product({ id: "mock-10", name: "SILENT STATIC HOODIE", price: 2699, hero: true, subcategoryId: "sub-wiws", categoryId: "cat-apparel", images: ["/model.png"] }),
  product({ id: "mock-11", name: "ECHO CHAMBER TEE", price: 1349, subcategoryId: "sub-wiws", categoryId: "cat-apparel", images: ["/skull.png"], isArchived: true }),
];

let warned = false;
export function warnMockData(label) {
  if (warned) return;
  warned = true;
  console.warn(
    `[mock-data] Firebase Admin isn't configured — serving placeholder ${label} so the UI renders. ` +
      "Fill in FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY in .env.local to use real data."
  );
}
