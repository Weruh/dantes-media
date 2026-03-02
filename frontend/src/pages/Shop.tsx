import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Section from "../components/Section";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import SalesCTA from "../components/SalesCTA";
import { ButtonLink } from "../components/Button";
import { productCategories } from "../data/productsData";
import { useCatalogProducts } from "../hooks/useCatalogProducts";

const Shop = () => {
  const { products } = useCatalogProducts();
  const [searchParams] = useSearchParams();
  const activeCategoryParam = searchParams.get("category");

  const availableCategories = useMemo(() => {
    const unique = new Set<string>(productCategories);
    for (const product of products) {
      unique.add(product.category);
    }
    return Array.from(unique);
  }, [products]);

  const activeCategory: string | null =
    availableCategories.find((category) => category === activeCategoryParam) ?? null;

  const filteredProducts = useMemo(
    () => (activeCategory ? products.filter((product) => product.category === activeCategory) : products),
    [activeCategory, products]
  );

  return (
    <>
      <Helmet>
        <title>Shop | Dantes Media</title>
        <meta
          name="description"
          content="Shop business-grade ICT hardware, networking, and security products from Dantes Media."
        />
      </Helmet>

      <Section>
        <SectionHeading title="Products Catalog" subtitle="Browse all products or filter by category." />
        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink to="/shop" variant={activeCategory ? "secondary" : "primary"}>
            All products
          </ButtonLink>
          {availableCategories.map((category) => (
            <ButtonLink
              key={category}
              to={`/shop?category=${encodeURIComponent(category)}`}
              variant={activeCategory === category ? "primary" : "secondary"}
            >
              {category}
            </ButtonLink>
          ))}
        </div>
        {activeCategory ? (
          <p className="mt-4 text-sm text-ink-500">
            Showing products in <span className="font-semibold text-ink-700">{activeCategory}</span>.
          </p>
        ) : null}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-ink-500">
            No products found.
          </div>
        )}
      </Section>

      <Section>
        <SalesCTA
          title="Need a tailored equipment list?"
          subtitle="We can bundle products with installation, training, and ongoing support in one proposal."
        />
      </Section>
    </>
  );
};

export default Shop;
