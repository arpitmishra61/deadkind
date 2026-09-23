import { notFound } from "next/navigation";
import ShopFooter from "@/components/shop/ShopFooter";
import { getColours, getSizes } from "@/lib/data/lookups";
import { getProductById, getRelatedProducts } from "@/lib/data/products";
import { getSubcategories } from "@/lib/data/subcategories";
import ProductInteractive from "./ProductInteractive";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product ? `Dead'Kind — ${product.name}` : "Dead'Kind — Product" };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  product.sku = product.sku || product.id.toUpperCase().slice(0, 8);

  const [colours, sizes, subcategories, related] = await Promise.all([
    getColours(),
    getSizes(),
    getSubcategories(),
    getRelatedProducts(product),
  ]);

  const subcategory = subcategories.find((s) => s.id === product.subcategoryId);
  const breadcrumbCategory = subcategory?.name || null;

  return (
    <>
      <ProductInteractive
        product={product}
        colours={colours}
        sizes={sizes}
        breadcrumbCategory={breadcrumbCategory}
        related={related}
      />
      <ShopFooter />
    </>
  );
}
