import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import Section from "../components/Section";
import Badge from "../components/Badge";
import { Button, ButtonLink } from "../components/Button";
import QuantityStepper from "../components/QuantityStepper";
import SalesCTA from "../components/SalesCTA";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { formatCurrency } from "../utils/format";
import { useCart } from "../app/cart/CartContext";

const summarizeSpec = (spec: string, maxLength = 180) => {
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

      <Section>
        <div className="text-sm text-ink-500">
          <Link to="/shop" className="hover:text-ink-900">
            Shop
          </Link>{" "}
          / <span className="text-ink-900">{product.name}</span>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex items-center justify-center overflow-hidden rounded-3xl bg-slate-100 p-4 md:p-6 lg:min-h-[620px]">
            <img
              src={product.image}
              alt={product.name}
              className="h-auto w-full max-h-[760px] max-w-[720px] object-contain"
              decoding="async"
            />
          </div>
          <div>
            <Badge variant="outline">{product.category}</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-ink-900 md:text-4xl">{product.name}</h1>
            <p className="mt-3 text-base text-ink-500">{product.shortDesc}</p>
            {singleSummarySpec ? (
              <div className="mt-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-700">
                  Product Specification
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-600">
                  <li>- {singleSummarySpec}</li>
                </ul>
              </div>
            ) : null}
            <div className="mt-4 text-2xl font-semibold text-ink-900">
              {formatCurrency(product.price)}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <QuantityStepper value={quantity} onChange={setQuantity} />
              <Button type="button" onClick={() => addItem(product, quantity)}>
                Add to Cart
              </Button>
              <ButtonLink to="/contact?tab=quote&serviceType=General%20Quote" variant="secondary">
                Talk to Sales
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-ink-500">
              Need installation or site survey? Our team can bundle this product into a deployment plan.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Ready to bundle equipment with installation?"
          subtitle="Book a site survey so we can confirm layout, cabling routes, and device placement."
        />
      </Section>
    </>
  );
};

export default ProductDetail;
