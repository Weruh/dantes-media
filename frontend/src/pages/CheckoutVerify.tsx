import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import Section from "../components/Section";
import Alert from "../components/Alert";
import { ButtonLink } from "../components/Button";
import { useCart } from "../app/cart/CartContext";
import { createApiUrl } from "../utils/api";
import { parseJsonSafely } from "../utils/http";

type VerifyResponse = {
  paid: boolean;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  message: string;
};

const formatAmount = (currency: string, amount: number) =>
  `${currency} ${amount.toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;

const CheckoutVerify = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const { clearCart } = useCart();
  const [state, setState] = useState<"pending" | "success" | "error">("pending");
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setState("error");
      setError("Missing transaction reference in callback URL.");
      return;
    }

    let cancelled = false;
    const verify = async () => {
      try {
        const response = await fetch(
          createApiUrl(`/paystack/verify/${encodeURIComponent(reference)}`)
        );
        const payload = await parseJsonSafely<Partial<VerifyResponse> & { message?: string }>(
          response
        );

        if (!response.ok || payload?.paid !== true) {
          throw new Error(payload?.message || "Payment was not verified.");
        }

        if (cancelled) return;
        clearCart();
        setResult(payload as VerifyResponse);
        setState("success");
      } catch (verifyError) {
        if (cancelled) return;
        setState("error");
        setError(verifyError instanceof Error ? verifyError.message : "Unable to verify payment.");
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [clearCart, reference]);

  return (
    <>
      <Helmet>
        <title>Payment Verification | Dantes Media</title>
        <meta
          name="description"
          content="Verifying your Paystack payment for your Dantes Media order."
        />
      </Helmet>

      <Section title="Payment Verification" subtitle="We are confirming your transaction status.">
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            {state === "pending" && (
              <Alert tone="info">Verifying payment with Paystack. Please wait...</Alert>
            )}

            {state === "success" && result && (
              <div className="space-y-4">
                <Alert tone="success">
                  Payment confirmed. Your order has been marked as paid.
                </Alert>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-ink-700">
                  <p>
                    <span className="font-semibold text-ink-900">Reference:</span> {result.reference}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-ink-900">Amount:</span>{" "}
                    {formatAmount(result.currency, result.amount)}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-ink-900">Status:</span> {result.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink to="/shop">Continue shopping</ButtonLink>
                  <ButtonLink to="/projects" variant="ghost">View projects</ButtonLink>
                </div>
              </div>
            )}

            {state === "error" && (
              <div className="space-y-4">
                <Alert tone="error">{error}</Alert>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink to="/checkout">Back to checkout</ButtonLink>
                  <ButtonLink to="/contact" variant="ghost">Contact support</ButtonLink>
                </div>
              </div>
            )}
          </Card>
        </div>
      </Section>
    </>
  );
};

export default CheckoutVerify;
