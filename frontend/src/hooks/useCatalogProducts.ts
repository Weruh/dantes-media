import { useEffect, useState } from "react";
import { loadCatalogProducts } from "../data/productsApi";
import type { ProductItem } from "../data/productsData";
import { productsData } from "../data/productsData";

export const useCatalogProducts = () => {
  const [products, setProducts] = useState<ProductItem[]>(productsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const catalog = await loadCatalogProducts();
      if (active) {
        setProducts(catalog);
        setLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
};
