import { useEffect, useState } from "react";
import { loadCatalogProducts } from "../data/productsApi";
import type { ProductItem } from "../data/catalogTypes";

export const useCatalogProducts = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const catalog = await loadCatalogProducts();
        if (active) {
          setProducts(catalog);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
};
