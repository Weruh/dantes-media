import type { ProductItem } from "./catalogTypes";
import { parseJsonSafely } from "../utils/http";

type CustomProductsResponse = {
  products?: unknown[];
};

let cachedCatalog: ProductItem[] | null = null;
let inflightCatalogRequest: Promise<ProductItem[]> | null = null;
let cachedBaseProducts: ProductItem[] | null = null;
let inflightBaseProductsRequest: Promise<ProductItem[]> | null = null;

export const resetCatalogCache = () => {
  cachedCatalog = null;
  inflightCatalogRequest = null;
};

const loadBaseProducts = async (): Promise<ProductItem[]> => {
  if (cachedBaseProducts) return cachedBaseProducts;
  if (inflightBaseProductsRequest) return inflightBaseProductsRequest;

  inflightBaseProductsRequest = import("./productsData")
    .then((module) => {
      cachedBaseProducts = module.productsData;
      return cachedBaseProducts;
    })
    .finally(() => {
      inflightBaseProductsRequest = null;
    });

  return inflightBaseProductsRequest;
};

const normalizeProduct = (value: unknown): ProductItem | null => {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;
  const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const category =
    typeof candidate.category === "string" ? candidate.category.trim() : "";
  const shortDesc =
    typeof candidate.shortDesc === "string" ? candidate.shortDesc.trim() : "";
  const price = Number(candidate.price);
  const image =
    typeof candidate.image === "string" && candidate.image.trim().length > 0
      ? candidate.image.trim()
      : "/assets/consultacy.jpg";
  const specs = Array.isArray(candidate.specs)
    ? candidate.specs
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];

  if (!id || !name || !category || !shortDesc || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  return {
    id,
    name,
    category,
    shortDesc,
    price,
    image,
    specs,
    featured: Boolean(candidate.featured),
  };
};

const dedupeById = (items: ProductItem[]) => {
  const byId = new Map<string, ProductItem>();
  for (const item of items) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values());
};

export const loadCatalogProducts = async (): Promise<ProductItem[]> => {
  if (cachedCatalog) return cachedCatalog;
  if (inflightCatalogRequest) return inflightCatalogRequest;

  inflightCatalogRequest = (async () => {
    const baseProducts = await loadBaseProducts();

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL ?? "/api";
      const response = await fetch(`${apiBase}/products/custom`);
      const payload = await parseJsonSafely<CustomProductsResponse>(response);

      if (!response.ok) {
        cachedCatalog = baseProducts;
        return baseProducts;
      }

      const customProducts = (payload?.products || [])
        .map((item) => normalizeProduct(item))
        .filter((item): item is ProductItem => item !== null);

      cachedCatalog = dedupeById([...baseProducts, ...customProducts]);
      return cachedCatalog;
    } catch {
      cachedCatalog = baseProducts;
      return baseProducts;
    } finally {
      inflightCatalogRequest = null;
    }
  })();

  return inflightCatalogRequest;
};
