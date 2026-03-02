import { Link } from "react-router-dom";
import type { ProductItem } from "../data/productsData";
import { Button, ButtonLink } from "./Button";
import Badge from "./Badge";
import Card from "./Card";
import { formatCurrency } from "../utils/format";
import { useCart } from "../app/cart/CartContext";

const ProductCard = ({ product }: { product: ProductItem }) => {
  const { addItem } = useCart();

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-none p-0 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6">
        <div className="flex-1">
          <Badge>{product.category}</Badge>
          <h3 className="mt-3 text-base font-semibold text-ink-900">{product.name}</h3>
          <p className="mt-2 text-sm text-ink-500 line-clamp-4">{product.shortDesc}</p>
          <Link
            to={`/shop/${product.id}`}
            className="mt-2 inline-block text-xs font-semibold text-brand-dark hover:text-ink-900"
          >
            Read more
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-semibold text-ink-900">{formatCurrency(product.price)}</span>
        </div>
        <div className="mt-3 grid gap-2">
          <Button type="button" onClick={() => addItem(product)}>
            Add to Cart
          </Button>
          <ButtonLink to={`/shop/${product.id}`} variant="secondary">
            View
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
