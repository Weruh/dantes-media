import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import Section from "../components/Section";
import Card from "../components/Card";
import Badge from "../components/Badge";
import QuantityStepper from "../components/QuantityStepper";
import { ButtonLink } from "../components/Button";
import Alert from "../components/Alert";
import { useCart } from "../app/cart/CartContext";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { formatCurrency } from "../utils/format";

const FALLBACK_PRODUCT_IMAGE = "/assets/consultacy.jpg";

const resolveCartImageSrc = (image: unknown) => {
  const src = typeof image === "string" ? image.trim() : "";
  if (!src) return FALLBACK_PRODUCT_IMAGE;

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

const Cart = () => {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { products } = useCatalogProducts();
  const productImageById = useMemo(
    () => new Map(products.map((product) => [product.id, product.image])),
    [products]
  );

  return (
    <>
      <Helmet>
        <title>Cart | Dantes Media</title>
        <meta name="description" content="Review your cart and proceed to checkout." />
      </Helmet>

      <Section title="Your Cart" subtitle="Review items, adjust quantities, and proceed to checkout.">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            {items.length === 0 && (
              <Card className="text-center">
                <p className="text-sm text-ink-500">Your cart is empty.</p>
                <Link to="/shop" className="mt-4 inline-flex text-sm font-semibold text-brand-dark">
                  Browse products &rarr;
                </Link>
              </Card>
            )}
            {items.map((item) => (
              <Card key={item.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <img
                    src={resolveCartImageSrc(productImageById.get(item.id) ?? item.image)}
                    alt={item.name}
                    className="h-20 w-20 rounded-2xl object-cover"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.dataset.fallback === "1") return;
                      target.dataset.fallback = "1";
                      target.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                  <div>
                    <Badge>{item.category}</Badge>
                    <h3 className="mt-2 text-base font-semibold text-ink-900">{item.name}</h3>
                    <p className="text-sm text-ink-500">{formatCurrency(item.price)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(value) => updateQuantity(item.id, value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs font-semibold text-ink-500 hover:text-ink-900"
                  >
                    Remove
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold text-ink-900">Order summary</h3>
              <div className="mt-4 flex items-center justify-between text-sm text-ink-600">
                <span>Subtotal</span>
                <span className="font-semibold text-ink-900">{formatCurrency(subtotal)}</span>
              </div>
              <p className="mt-3 text-xs text-ink-500">
                Pricing is indicative. Final quotes are confirmed after requirement validation.
              </p>
              {items.length > 0 ? (
                <ButtonLink to="/checkout" className="mt-4 w-full">
                  Proceed to checkout
                </ButtonLink>
              ) : (
                <Alert className="mt-4">Add products to your cart before checking out.</Alert>
              )}
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Cart;
