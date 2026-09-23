import { getAllProducts } from "@/lib/data/products";
import { getSubcategories } from "@/lib/data/subcategories";
import DashboardHome from "./DashboardHome";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DeadKind — DK-2050",
};

const DEFAULT_THEME = "rebel";
const DEFAULT_SUBCATEGORY_NAME = "BEYOND THE SYSTEM";

export default async function Page() {
  const subcategories = await getSubcategories();
  const target = DEFAULT_SUBCATEGORY_NAME.toUpperCase().trim();
  const defaultSub = subcategories.find((s) => (s.name || "").toUpperCase().trim() === target);
  const initialProducts = defaultSub ? await getAllProducts({ subcategoryId: defaultSub.id }) : [];

  return <DashboardHome subcategories={subcategories} initialTheme={DEFAULT_THEME} initialProducts={initialProducts} />;
}
