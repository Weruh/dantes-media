import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Check, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Section from "../components/Section";
import Badge from "../components/Badge";
import { Button, ButtonLink } from "../components/Button";
import QuantityStepper from "../components/QuantityStepper";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { formatCurrency } from "../utils/format";
import { useCart } from "../app/cart/CartContext";

const summarizeSpec = (spec: string, maxLength = 130) => {
  const cleaned = spec.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;

  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const safeSlice = lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated;

  return `${safeSlice}...`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { products, loading } = useCatalogProducts();
  const product = products.find((item) => item.id === id);
  const [quantity, setQuantity] = useState(1);
  const singleSummarySpec =
    product?.specs.length ? summarizeSpec(product.specs[0]) : "";
  const assuranceItems = [
    {
      icon: ShieldCheck,
      label: "Genuine, manufacturer-warranted",
    },
    {
      icon: Truck,
      label: "Nationwide delivery available",
    },
    {
      icon: Check,
      label: "Installation by certified technicians",
    },
    {
      icon: Check,
      label: "After-sales support & SLAs",
    },
  ];

  if (!product && loading) {
    return (
      <Section title="Loading product..." subtitle="Please wait a moment.">
        <p className="text-sm text-ink-500">Fetching product details...</p>
      </Section>
    );
  }

  if (!product) {
    return (
      <Section title="Product not found" subtitle="We couldn't locate this product.">
        <Link to="/shop" className="text-sm font-semibold text-brand-dark">
          Back to Shop &rarr;
        </Link>
      </Section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | Dantes Media</title>
        <meta name="description" content={product.shortDesc} />
      </Helmet>

      <Section className="bg-gradient-to-br from-white via-white to-brand-soft/50 py-0">
        <div className="grid gap-5 py-0 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <div className="flex items-center justify-center lg:min-h-[360px]">
            <img
              src={product.image}
              alt={product.name}
              className="h-auto w-full max-h-[360px] max-w-[410px] object-contain"
              decoding="async"
            />
          </div>
          <div className="pb-8 lg:pb-0">
            <Badge
              variant="outline"
              className="rounded-none border-0 px-0 py-0 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-dark"
            >
              {product.category}
            </Badge>
            <h1 className="mt-2 max-w-3xl text-xl font-bold leading-[1.1] text-ink-900 md:text-3xl">
              {product.name}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-ink-700">
              {product.shortDesc}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
              <p className="text-xl font-bold text-ink-900 md:text-2xl">
                {formatCurrency(product.price)}
              </p>
              <p className="pb-1 text-xs font-medium text-ink-700">
                VAT inclusive · Nairobi pickup
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} />
              <Button
                type="button"
                onClick={() => addItem(product, quantity)}
                className="rounded-xl bg-brand px-5 py-2.5 text-sm text-ink-900 hover:bg-brand-dark hover:text-ink-900"
              >
                <ShoppingCart className="h-4 w-4" />
                Add To Cart
              </Button>
              <ButtonLink
                to="/contact?tab=quote&serviceType=General%20Quote"
                variant="secondary"
                className="rounded-xl border-brand/40 bg-white px-5 py-2.5 text-sm text-ink-900 hover:border-brand-dark"
              >
                Talk to Sales
              </ButtonLink>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {assuranceItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex min-h-16 items-center gap-3 rounded-xl border border-brand/30 bg-white/70 p-3 text-xs font-medium leading-snug text-ink-700"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-dark">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
            {singleSummarySpec ? (
              <div className="mt-4 max-w-4xl rounded-xl border border-brand/25 bg-white/70 p-3 text-xs leading-5 text-ink-500">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-dark">
                  Product Specification
                </h2>
                <p className="mt-2">{singleSummarySpec}</p>
              </div>
            ) : null}
            <Link
              to="/shop"
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-dark hover:text-ink-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all products
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
};

export default ProductDetail;
