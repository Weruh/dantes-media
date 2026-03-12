import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ProductItem } from "../../data/catalogTypes";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: ProductItem, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

type StoredCartPayload = {
  version: number;
  updatedAt: number;
  items: unknown[];
};

const CART_STORAGE_VERSION = 2;
const CART_KEY = "dantes-media-cart-v2";
const LEGACY_CART_KEYS = ["dantes-media-cart"];
const CART_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const FALLBACK_PRODUCT_IMAGE = "/assets/consultacy.jpg";
const CartContext = createContext<CartContextValue | undefined>(undefined);

const normalizeImagePath = (image: unknown) => {
  const src = typeof image === "string" ? image.trim() : "";
  if (!src) return "";

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  return src.startsWith("/") ? src : `/${src}`;
};

const normalizeStoredCartItem = (item: unknown): CartItem | null => {
  if (!item || typeof item !== "object") return null;

  const candidate = item as Record<string, unknown>;
  const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const category = typeof candidate.category === "string" ? candidate.category.trim() : "";
  const quantity = Number(candidate.quantity);
  const price = Number(candidate.price);

  if (!id || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  return {
    id,
    name: name || "Product",
    price,
    image: normalizeImagePath(candidate.image) || FALLBACK_PRODUCT_IMAGE,
    category: category || "General",
    quantity: Math.max(1, Math.round(quantity)),
  };
};

const readStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(CART_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];

    const payload = parsed as Partial<StoredCartPayload>;
    const updatedAt = Number(payload.updatedAt);
    if (payload.version !== CART_STORAGE_VERSION) return [];
    if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > CART_MAX_AGE_MS) return [];
    if (!Array.isArray(payload.items)) return [];

    return payload.items
      .map((item) => normalizeStoredCartItem(item))
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());

  useEffect(() => {
    if (typeof window === "undefined") return;
    for (const legacyKey of LEGACY_CART_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (items.length === 0) {
      window.localStorage.removeItem(CART_KEY);
      return;
    }

    const payload: StoredCartPayload = {
      version: CART_STORAGE_VERSION,
      updatedAt: Date.now(),
      items,
    };
    window.localStorage.setItem(CART_KEY, JSON.stringify(payload));
  }, [items]);

  const addItem = (product: ProductItem, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: normalizeImagePath(product.image) || FALLBACK_PRODUCT_IMAGE,
          category: product.category,
          quantity,
        },
      ];
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (Number.isNaN(quantity) || quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );
  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
    }),
    [items, subtotal, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
