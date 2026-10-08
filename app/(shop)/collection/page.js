import { getCategories } from "@/lib/data/categories";
import { getColours, getSizes } from "@/lib/data/lookups";
import { getAllProducts } from "@/lib/data/products";
import { findSubcategoryByName, getSubcategories } from "@/lib/data/subcategories";
import CollectionBrowser from "./CollectionBrowser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dead'Kind — Shop All",
};

export default async function CollectionPage({ searchParams }) {
  const params = await searchParams;
  const subParam = params?.subcategory || params?.collection || null;

  const [products, categories, colours, sizes] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getColours(),
    getSizes(),
  ]);

  let initialCategory = "all";
  let initialCollections = [];

  if (subParam) {
    const matchedSub = await findSubcategoryByName(subParam);
    if (matchedSub) {
      initialCollections = [matchedSub.id];
      if (matchedSub.categoryId) initialCategory = matchedSub.categoryId;
    }
  }

  const initialSubcategories = await getSubcategories(initialCategory !== "all" ? initialCategory : undefined);

  return (
    <CollectionBrowser
      key={subParam || "all"}
      initialProducts={products}
      categories={categories}
      initialSubcategories={initialSubcategories}
      colours={colours}
      sizes={sizes}
      initialCategory={initialCategory}
      initialCollections={initialCollections}
    />
  );
}
