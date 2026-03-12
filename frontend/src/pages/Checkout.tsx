import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Section from "../components/Section";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { Button } from "../components/Button";
import { Input, SelectField, Textarea } from "../components/Input";
import Alert from "../components/Alert";
import { useCart } from "../app/cart/CartContext";
import { createApiUrl } from "../utils/api";
import { parseJsonSafely } from "../utils/http";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  county: z.string().min(2, "County is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliveryWindow: z.string().min(1, "Delivery window is required"),
  deliveryNotes: z.string().optional(),
  paymentPhone: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const formatKsh = (value: number) => `KSh ${value.toLocaleString("en-KE")}`;

const Checkout = () => {
  const { items, subtotal } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = items.length > 0 ? 200 : 0;
  const total = subtotal + deliveryFee;
  const [activeStep, setActiveStep] = useState<"address" | "delivery" | "payment">("address");
  const [completed, setCompleted] = useState({ address: false, delivery: false });
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "error">("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const addressRef = useRef<HTMLDivElement>(null);
  const deliveryRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  const {
    register,
    trigger,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      deliveryWindow: "",
      deliveryNotes: "",
      paymentPhone: "",
    },
  });

  const [
    fullName,
    email,
    phone,
    address,
    city,
    county,
    deliveryDate,
    deliveryWindow,
    deliveryNotes,
    paymentPhone,
  ] = watch([
    "fullName",
    "email",
    "phone",
    "address",
    "city",
    "county",
    "deliveryDate",
    "deliveryWindow",
    "deliveryNotes",
    "paymentPhone",
  ]);

  useEffect(() => {
    if (phone && !paymentPhone) {
      setValue("paymentPhone", phone);
    }
  }, [phone, paymentPhone, setValue]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddressContinue = async () => {
    const valid = await trigger(["fullName", "email", "phone", "address", "city", "county"]);
    if (!valid) return;
    setCompleted((prev) => ({ ...prev, address: true }));
    setActiveStep("delivery");
    setTimeout(() => scrollTo(deliveryRef), 50);
  };

  const handleDeliveryContinue = async () => {
    const valid = await trigger(["deliveryDate", "deliveryWindow"]);
    if (!valid) return;
    setCompleted((prev) => ({ ...prev, delivery: true }));
    setActiveStep("payment");
    setTimeout(() => scrollTo(paymentRef), 50);
  };

  const handlePay = async () => {
    if (items.length === 0) {
      setPaymentStatus("error");
      setPaymentError("Add items to your cart before attempting payment.");
      return;
    }

    if (!completed.address) {
      setActiveStep("address");
      scrollTo(addressRef);
      return;
    }

    if (!completed.delivery) {
      setActiveStep("delivery");
      scrollTo(deliveryRef);
      return;
    }

    const valid = await trigger([
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "county",
      "deliveryDate",
      "deliveryWindow",
    ]);
    if (!valid) {
      setPaymentStatus("error");
      setPaymentError("Please complete all required checkout details.");
      return;
    }

    setPaymentStatus("pending");
    setPaymentError(null);

    try {
      const response = await fetch(createApiUrl("/paystack/initialize"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            fullName,
            email,
            phone,
            address,
            city,
            county,
          },
          delivery: {
            deliveryDate,
            deliveryWindow,
            deliveryNotes,
          },
          paymentPhone,
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });

      const payload = await parseJsonSafely<{
        authorizationUrl?: string;
        message?: string;
      }>(response);

      const authorizationUrl = payload?.authorizationUrl;
      if (!response.ok || !authorizationUrl) {
        throw new Error(
          payload?.message ||
            (response.status >= 500
              ? "Payment service is unavailable. Ensure the backend API is running, then try again."
              : "Unable to initialize payment.")
        );
      }

      window.location.assign(authorizationUrl);
    } catch (error) {
      setPaymentStatus("error");
      const message = error instanceof Error ? error.message : "Unable to initialize payment.";
      if (message.toLowerCase().includes("failed to fetch")) {
        setPaymentError(
          "Could not reach payment API. Start backend with `npm run dev:server` or `npm run dev:full`."
        );
        return;
      }
      setPaymentError(message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout | Dantes Media</title>
        <meta name="description" content="Enter delivery details and pay with Paystack." />
      </Helmet>

      <Section
        eyebrow={
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
          >
            <span aria-hidden="true">&larr;</span>
            Back to cart
          </Link>
        }
        title="Checkout"
        subtitle="Complete your delivery details and pay securely via Paystack."
      >
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {items.length === 0 && (
              <Alert tone="info">
                Your cart is empty. <Link to="/shop" className="font-semibold text-brand-dark">Browse products</Link> to continue.
              </Alert>
            )}

            <div ref={addressRef}>
              <Card>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Step 1</p>
                    <h3 className="text-lg font-semibold text-ink-900">Customer address</h3>
                  </div>
                  {completed.address && activeStep !== "address" && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs font-semibold"
                      onClick={() => {
                        setActiveStep("address");
                        scrollTo(addressRef);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {activeStep === "address" ? (
                  <>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <Input label="Full name" error={errors.fullName?.message} placeholder="Jane Doe" {...register("fullName")} />
                      <Input label="Email" error={errors.email?.message} placeholder="name@company.com" {...register("email")} />
                      <Input label="Phone" error={errors.phone?.message} placeholder="+254 7XX XXX XXX" {...register("phone")} />
                      <Input label="County" error={errors.county?.message} placeholder="Mombasa" {...register("county")} />
                      <Input label="City" error={errors.city?.message} placeholder="Likoni" {...register("city")} />
                      <Input label="Address" error={errors.address?.message} placeholder="Street, Building, Floor" {...register("address")} />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button type="button" onClick={handleAddressContinue} disabled={items.length === 0}>
                        Continue to delivery
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-ink-500">
                    {fullName ? `${fullName} · ${phone}` : "Address saved."} {address ? `· ${address}` : ""}
                  </p>
                )}
              </Card>
            </div>

            <div ref={deliveryRef}>
              <Card>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Step 2</p>
                    <h3 className="text-lg font-semibold text-ink-900">Delivery details</h3>
                  </div>
                  {completed.delivery && activeStep !== "delivery" && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs font-semibold"
                      onClick={() => {
                        setActiveStep("delivery");
                        scrollTo(deliveryRef);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {activeStep === "delivery" ? (
                  <>
                    {!completed.address && (
                      <Alert className="mt-4">
                        Complete customer address to continue.
                      </Alert>
                    )}
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <Input
                        label="Preferred delivery date"
                        type="date"
                        error={errors.deliveryDate?.message}
                        {...register("deliveryDate")}
                      />
                      <SelectField
                        label="Delivery window"
                        error={errors.deliveryWindow?.message}
                        {...register("deliveryWindow")}
                      >
                        <option value="">Select a time window</option>
                        <option value="Morning">Morning (8am - 12pm)</option>
                        <option value="Afternoon">Afternoon (12pm - 4pm)</option>
                        <option value="Evening">Evening (4pm - 7pm)</option>
                      </SelectField>
                    </div>
                    <div className="mt-4">
                      <Textarea
                        label="Delivery notes (optional)"
                        placeholder="Access instructions, preferred contact, site restrictions"
                        {...register("deliveryNotes")}
                      />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={handleDeliveryContinue}
                        disabled={!completed.address || items.length === 0}
                      >
                        Continue to payment
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-ink-500">
                    {deliveryDate ? `${deliveryDate}` : "Delivery details saved."} {deliveryWindow ? `· ${deliveryWindow}` : ""}
                  </p>
                )}
              </Card>
            </div>

            <div ref={paymentRef}>
              <Card>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Step 3</p>
                    <h3 className="text-lg font-semibold text-ink-900">Payment method</h3>
                  </div>
                </div>

                {activeStep === "payment" ? (
                  <>
                    {!completed.delivery && (
                      <Alert className="mt-4">
                        Complete delivery details to continue.
                      </Alert>
                    )}
                    <div className="mt-4 inline-flex">
                      <Badge>Paystack Checkout</Badge>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Input
                        label="Payment phone number (optional)"
                        placeholder="+254 7XX XXX XXX"
                        error={errors.paymentPhone?.message}
                        {...register("paymentPhone")}
                      />
                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-ink-600">
                      You will be redirected to Paystack to pay <span className="font-semibold text-ink-900">{formatKsh(total)}</span>.
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={handlePay}
                        disabled={items.length === 0 || paymentStatus === "pending"}
                      >
                        {paymentStatus === "pending" ? "Redirecting to Paystack..." : `Pay ${formatKsh(total)}`}
                      </Button>
                    </div>
                    {paymentStatus === "error" && paymentError && (
                      <Alert tone="error" className="mt-4">
                        {paymentError}
                      </Alert>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-sm text-ink-500">Payment step pending.</p>
                )}
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold text-ink-900">Order summary</h3>
              <div className="mt-4 border-t border-slate-200 text-sm text-ink-700">
                <div className="flex items-center justify-between py-3">
                  <span>Items total ({itemCount})</span>
                  <span className="font-semibold text-ink-900">{formatKsh(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 py-3">
                  <span>Delivery fees</span>
                  <span className="font-semibold text-ink-900">{formatKsh(deliveryFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-ink-900">
                  <span>Total</span>
                  <span className="text-xl">{formatKsh(total)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Checkout;

