import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Section from "../components/Section";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import SalesCTA from "../components/SalesCTA";
import { defaultProductCategories } from "../data/catalogTypes";
import { useCatalogProducts } from "../hooks/useCatalogProducts";

const PRODUCTS_PAGE_SIZE = 24;
const SORT_OPTIONS: Intl.CollatorOptions = { sensitivity: "base" };
const FEATURED_CATEGORY = "Featured Products";

const Shop = () => {
  const { products, loading } = useCatalogProducts();
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PAGE_SIZE);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategoryParam = searchParams.get("category");
  const requestedCategory = activeCategoryParam?.trim() ?? "";
  const hasCategoryFilter = requestedCategory.length > 0;

  const availableCategories = useMemo(() => {
    const unique = new Set<string>(defaultProductCategories);
    for (const product of products) {
      unique.add(product.category);
    }
    return Array.from(unique)
      .filter((category) => category !== FEATURED_CATEGORY)
      .sort((a, b) => a.localeCompare(b, undefined, SORT_OPTIONS));
  }, [products]);

  const nonFeaturedProducts = useMemo(
    () => products.filter((product) => product.category !== FEATURED_CATEGORY),
    [products]
  );

  const activeCategory = useMemo(() => {
    if (!requestedCategory) return null;
    const normalizedCategoryParam = requestedCategory.toLowerCase();

    return (
      availableCategories.find(
        (category) => category.toLowerCase() === normalizedCategoryParam
      ) ?? requestedCategory
    );
  }, [availableCategories, requestedCategory]);

  const filteredProducts = useMemo(
    () => {
      const categoryProducts = hasCategoryFilter && activeCategory
        ? nonFeaturedProducts.filter((product) => product.category === activeCategory)
        : nonFeaturedProducts;

      return [...categoryProducts].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, SORT_OPTIONS)
      );
    },
    [activeCategory, hasCategoryFilter, nonFeaturedProducts]
  );
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );
  const hasMoreProducts = visibleCount < filteredProducts.length;

  useEffect(() => {
    setVisibleCount(PRODUCTS_PAGE_SIZE);
  }, [requestedCategory]);

  useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!categoryMenuRef.current) return;
      if (categoryMenuRef.current.contains(event.target as Node)) return;
      setIsCategoryMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedCategory = hasCategoryFilter ? activeCategory ?? requestedCategory : "all";
  const selectedCategoryLabel = hasCategoryFilter ? activeCategory ?? requestedCategory : "All products";

  const handleCategoryChange = (value: string) => {
    setIsCategoryMenuOpen(false);

    if (value === "all") {
      navigate("/shop");
      return;
    }

    navigate(`/shop?category=${encodeURIComponent(value)}`);
  };

  return (
    <>
      <Helmet>
        <title>Shop | Dantes Media</title>
        <meta
          name="description"
          content="Shop business-grade ICT hardware, networking, and security products from Dantes Media."
        />
      </Helmet>

      <Section className="pt-0 pb-16">
        <SectionHeading title="Products Catalog" subtitle="Browse all products or filter by category." />
        <div className="relative mt-6 max-w-xl" ref={categoryMenuRef}>
          <p id="shop-category-label" className="mb-2 block text-sm font-semibold text-ink-700">
            Category
          </p>
          <button
            id="shop-category-trigger"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isCategoryMenuOpen}
            aria-labelledby="shop-category-label shop-category-trigger"
            onClick={() => setIsCategoryMenuOpen((current) => !current)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-ink-800 focus:border-brand-dark focus:outline-none"
          >
            <span className="truncate pr-4">{selectedCategoryLabel}</span>
            <span className="text-xs text-ink-500" aria-hidden="true">
              {isCategoryMenuOpen ? "\u25B2" : "\u25BC"}
            </span>
          </button>

          {isCategoryMenuOpen && (
            <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <ul role="listbox" aria-labelledby="shop-category-label" className="max-h-64 overflow-y-auto py-1">
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedCategory === "all"}
                    onClick={() => handleCategoryChange("all")}
                    className="block w-full px-4 py-2 text-left text-sm text-ink-800 transition hover:bg-slate-100"
                  >
                    All products
                  </button>
                </li>
                {availableCategories.map((category) => (
                  <li key={category}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedCategory === category}
                      onClick={() => handleCategoryChange(category)}
                      className="block w-full px-4 py-2 text-left text-sm text-ink-800 transition hover:bg-slate-100"
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {hasCategoryFilter ? (
          <p className="mt-4 text-sm text-ink-500">
            Showing products in <span className="font-semibold text-ink-700">{activeCategory}</span>.
          </p>
        ) : null}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <div key={product.id} className="[content-visibility:auto] [contain-intrinsic-size:450px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        {loading && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-ink-500">
            Loading products...
          </div>
        )}
        {!loading && filteredProducts.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-ink-500">
            No products found.
          </div>
        )}
        {!loading && hasMoreProducts && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-ink-900 transition hover:border-slate-400"
              onClick={() => setVisibleCount((current) => current + PRODUCTS_PAGE_SIZE)}
            >
              Load more products
            </button>
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
