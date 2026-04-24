import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProductItem } from "../data/catalogTypes";
import Badge from "./Badge";
import Card from "./Card";
import { formatCurrency } from "../utils/format";
import { useCart } from "../app/cart/CartContext";

const ProductCard = ({ product }: { product: ProductItem }) => {
  const { addItem } = useCart();

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-lg border-brand/35 bg-white p-0 transition duration-300 hover:-translate-y-1 hover:border-brand-dark hover:shadow-lg">
      <Link
        to={`/shop/${product.id}`}
        aria-label={`View ${product.name}`}
        className="absolute inset-0 z-10"
      />
      <div className="overflow-hidden bg-brand-soft">
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover object-center transition duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <Badge className="text-[10px]">{product.category}</Badge>
          <h3 className="mt-2 text-xs font-semibold leading-5 text-ink-900">{product.name}</h3>
          <p className="mt-2 text-[11px] leading-5 text-ink-500 line-clamp-4">{product.shortDesc}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-ink-900">{formatCurrency(product.price)}</span>
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addItem(product);
            }}
            className="relative z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-dark transition hover:bg-brand hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
