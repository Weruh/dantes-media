import { DELIVERY_FEE, PRODUCT_NAME_BY_ID, PRODUCT_PRICE_BY_ID } from "./catalog.ts";
import { sendPlainTextEmail } from "./email.ts";
import { getServiceRoleClient, getSupabaseEnv } from "./supabase.ts";

const PAYSTACK_SECRET_KEY = getSupabaseEnv("PAYSTACK_SECRET_KEY");
const PAYSTACK_CURRENCY = getSupabaseEnv("PAYSTACK_CURRENCY", "KES");
const PAYSTACK_CALLBACK_URL = getSupabaseEnv("PAYSTACK_CALLBACK_URL");
const SELLER_NOTIFY_EMAIL = getSupabaseEnv("SELLER_NOTIFY_EMAIL");

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeProductId = (value: unknown) =>
  typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
        .replace(/[\u2010-\u2015\u2212]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";

const BASE_PRODUCT_ID_BY_NORMALIZED = Object.freeze(
  Object.keys(PRODUCT_PRICE_BY_ID).reduce<Record<string, string>>((map, id) => {
    map[normalizeProductId(id)] = id;
    return map;
  }, {})
);

const formatAmount = (value: number) => `KES ${value.toLocaleString("en-KE")}`;

const formatOrderDateTime = (value: number) =>
  new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(new Date(value));

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toIsoString = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? new Date(value).toISOString()
    : null;

const toTimestamp = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const createReference = () => `DM-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

const resolveProductId = (rawId: unknown, customProducts: Map<string, { name: string; price: number }>) => {
  const id = typeof rawId === "string" ? rawId.trim() : "";
  if (!id) return "";

  if (typeof PRODUCT_PRICE_BY_ID[id] === "number" || customProducts.has(id)) {
    return id;
  }

  const normalizedId = normalizeProductId(id);
  if (!normalizedId) return "";

  const baseId = BASE_PRODUCT_ID_BY_NORMALIZED[normalizedId];
  if (baseId) return baseId;
  if (customProducts.has(normalizedId)) return normalizedId;

  return normalizedId;
};

const getProductPrice = (id: string, customProducts: Map<string, { name: string; price: number }>) => {
  const resolvedId = resolveProductId(id, customProducts);
  const knownPrice = PRODUCT_PRICE_BY_ID[resolvedId];
  if (typeof knownPrice === "number") return knownPrice;
  return customProducts.get(resolvedId)?.price;
};

const getProductName = (id: string, customProducts: Map<string, { name: string; price: number }>) => {
  const resolvedId = resolveProductId(id, customProducts);
  return PRODUCT_NAME_BY_ID[resolvedId] || customProducts.get(resolvedId)?.name || resolvedId || id;
};

const normalizeItemCollection = (items: unknown) => {
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object") return Object.values(items);
  return [];
};

const normalizeItems = (
  items: unknown,
  customProducts: Map<string, { name: string; price: number }>
) => {
  const entries = normalizeItemCollection(items);
  const normalized: Array<{
    id: string;
    quantity: number;
    name?: string;
    unitPrice?: number | null;
    image?: string;
    category?: string;
  }> = [];

  for (const item of entries) {
    const rawId =
      typeof item?.id === "string"
        ? item.id
        : typeof item?.productId === "string"
          ? item.productId
          : typeof item?.sku === "string"
            ? item.sku
            : typeof item?.name === "string"
              ? item.name
              : "";
    const id = resolveProductId(rawId, customProducts);
    const quantity = Number(item?.quantity ?? item?.qty ?? item?.count);

    if (!id || !Number.isInteger(quantity) || quantity <= 0) continue;

    const unitPrice = Number(item?.unitPrice ?? item?.price);
    normalized.push({
      id,
      quantity,
      ...(typeof item?.name === "string" && item.name.trim() ? { name: item.name.trim() } : {}),
      ...(Number.isFinite(unitPrice) && unitPrice > 0 ? { unitPrice } : {}),
      ...(typeof item?.image === "string" && item.image.trim() ? { image: item.image.trim() } : {}),
      ...(typeof item?.category === "string" && item.category.trim()
        ? { category: item.category.trim() }
        : {}),
    });
  }

  return normalized;
};

const getOrderItemUnitPrice = (
  item: { id: string; unitPrice?: number | null },
  customProducts: Map<string, { name: string; price: number }>
) =>
  typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice) && item.unitPrice > 0
    ? item.unitPrice
    : getProductPrice(item.id, customProducts);

const buildOrderItemSnapshots = (
  items: unknown,
  customProducts: Map<string, { name: string; price: number }>
) =>
  normalizeItems(items, customProducts).map((item) => {
    const unitPrice = getOrderItemUnitPrice(item, customProducts);

    return {
      id: item.id,
      quantity: item.quantity,
      name: item.name || getProductName(item.id, customProducts),
      unitPrice: typeof unitPrice === "number" ? unitPrice : null,
      image: item.image || "",
      category: item.category || "",
    };
  });

const computeTotals = (
  items: Array<{ id: string; quantity: number; unitPrice?: number | null }>,
  customProducts: Map<string, { name: string; price: number }>
) => {
  let subtotal = 0;
  for (const item of items) {
    const price = getOrderItemUnitPrice(item, customProducts);
    if (typeof price !== "number") {
      throw new Error(`Unknown product id: ${item.id}`);
    }
    subtotal += price * item.quantity;
  }

  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
};

const normalizeTotals = (
  items: Array<{ id: string; quantity: number; unitPrice?: number | null }>,
  amountMinor: number,
  customProducts: Map<string, { name: string; price: number }>
) => {
  try {
    return computeTotals(items, customProducts);
  } catch {
    return {
      subtotal: amountMinor / 100,
      deliveryFee: 0,
      total: amountMinor / 100,
    };
  }
};

const buildLineItems = (
  items: Array<{ id: string; quantity: number; name?: string; unitPrice?: number | null }>,
  customProducts: Map<string, { name: string; price: number }>
) =>
  items.map((item) => {
    const unitPrice = getOrderItemUnitPrice(item, customProducts);
    const quantity = item.quantity;
    return {
      id: item.id,
      name: item.name || getProductName(item.id, customProducts),
      quantity,
      unitPrice: unitPrice ?? null,
      lineTotal: typeof unitPrice === "number" ? unitPrice * quantity : null,
    };
  });

const buildOrderLineItems = (
  order: OrderRecord,
  customProducts: Map<string, { name: string; price: number }>
) =>
  buildLineItems(order.items, customProducts).map((item) => ({
    ...item,
    lineAmount: typeof item.lineTotal === "number" ? formatAmount(item.lineTotal) : "N/A",
  }));

const createOrderMessage = (
  order: OrderRecord,
  customProducts: Map<string, { name: string; price: number }>
) => {
  const itemLines = buildOrderLineItems(order, customProducts)
    .map((item) => `- ${item.name} | Qty: ${item.quantity} | Total: ${item.lineAmount}`)
    .join("\n");

  return [
    "New paid order received",
    `Reference: ${order.reference}`,
    `Paid at: ${formatOrderDateTime(order.paidAt || order.createdAt)}`,
    `Payment source: ${order.paidVia || "N/A"}`,
    "",
    "Buyer credentials",
    `Full name: ${order.customer.fullName}`,
    `Email: ${order.customer.email}`,
    `Phone: ${order.customer.phone}`,
    `Payment phone: ${order.paymentPhone || order.customer.phone || "N/A"}`,
    "",
    "Delivery details",
    `Address: ${order.customer.address}`,
    `City: ${order.customer.city}`,
    `County: ${order.customer.county}`,
    `Delivery date: ${order.delivery.deliveryDate}`,
    `Delivery window: ${order.delivery.deliveryWindow}`,
    order.delivery.deliveryNotes ? `Delivery notes: ${order.delivery.deliveryNotes}` : "",
    "",
    "Products purchased",
    itemLines || "- No product details captured",
    "",
    "Order totals",
    `Subtotal: ${formatAmount(order.totals.subtotal)}`,
    `Delivery fee: ${formatAmount(order.totals.deliveryFee)}`,
    `Total paid: ${formatAmount(order.amountMinor / 100)} ${order.currency}`,
  ]
    .filter(Boolean)
    .join("\n");
};

const createCustomerOrderMessage = (
  order: OrderRecord,
  customProducts: Map<string, { name: string; price: number }>
) => {
  const itemLines = buildOrderLineItems(order, customProducts)
    .map((item) => `- ${item.name} | Qty: ${item.quantity} | Total: ${item.lineAmount}`)
    .join("\n");

  return [
    `Hello ${order.customer.fullName},`,
    "",
    "Your order has been received and payment has been confirmed.",
    `Reference: ${order.reference}`,
    `Paid at: ${formatOrderDateTime(order.paidAt || order.createdAt)}`,
    "",
    "Products purchased",
    itemLines || "- No product details captured",
    "",
    "Delivery details",
    `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.county}`,
    `Delivery date: ${order.delivery.deliveryDate}`,
    `Delivery window: ${order.delivery.deliveryWindow}`,
    order.delivery.deliveryNotes ? `Delivery notes: ${order.delivery.deliveryNotes}` : "",
    "",
    "Order totals",
    `Subtotal: ${formatAmount(order.totals.subtotal)}`,
    `Delivery fee: ${formatAmount(order.totals.deliveryFee)}`,
    `Total paid: ${formatAmount(order.amountMinor / 100)} ${order.currency}`,
    "",
    "If you need help with this order, reply to this email.",
    "",
    "Dantes Media",
  ]
    .filter(Boolean)
    .join("\n");
};

const createOrderEmailHtml = (
  title: string,
  intro: string,
  order: OrderRecord,
  customProducts: Map<string, { name: string; price: number }>
) => {
  const lineItems = buildOrderLineItems(order, customProducts)
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #dbe4f0;">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border:1px solid #dbe4f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #dbe4f0;text-align:right;">${escapeHtml(item.lineAmount)}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
        <h1 style="margin:0 0 8px;font-size:24px;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 20px;color:#475569;">${escapeHtml(intro)}</p>
        <p style="margin:4px 0;"><strong>Reference:</strong> ${escapeHtml(order.reference)}</p>
        <p style="margin:4px 0;"><strong>Paid at:</strong> ${escapeHtml(
          formatOrderDateTime(order.paidAt || order.createdAt)
        )}</p>
        <div style="margin-top:24px;">
          <h2 style="font-size:16px;margin:0 0 10px;">Products purchased</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:8px;border:1px solid #dbe4f0;text-align:left;">Product</th>
                <th style="padding:8px;border:1px solid #dbe4f0;text-align:center;">Qty</th>
                <th style="padding:8px;border:1px solid #dbe4f0;text-align:right;">Line total</th>
              </tr>
            </thead>
            <tbody>${lineItems}</tbody>
          </table>
        </div>
      </div>
    </div>`;
};

const paystackRequest = async (path: string, init: RequestInit = {}) => {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not set.");
  }

  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.status !== true || !payload?.data) {
    throw new Error(payload?.message || `Paystack request failed (${response.status}).`);
  }

  return payload.data;
};

const getCustomProductsMap = async () => {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.from("custom_products").select("id,name,price");
  if (error) throw new Error(`Unable to load custom products: ${error.message}`);

  return new Map(
    (data || []).map((item) => [
      item.id,
      {
        name: item.name,
        price: Number(item.price),
      },
    ])
  );
};

type OrderRecord = {
  reference: string;
  status: string;
  currency: string;
  amountMinor: number;
  totals: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  items: Array<{
    id: string;
    quantity: number;
    name?: string;
    unitPrice?: number | null;
    image?: string;
    category?: string;
  }>;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    county: string;
  };
  delivery: {
    deliveryDate: string;
    deliveryWindow: string;
    deliveryNotes: string;
  };
  paymentPhone: string;
  createdAt: number;
  paidAt: number | null;
  paidVia: string | null;
  emailNotifiedAt: number | null;
  customerEmailNotifiedAt: number | null;
  whatsappNotifiedAt: number | null;
};

const toOrderRow = (order: OrderRecord) => ({
  reference: order.reference,
  status: order.status,
  currency: order.currency,
  amount_minor: order.amountMinor,
  totals: order.totals,
  items: order.items,
  customer: order.customer,
  delivery: order.delivery,
  payment_phone: order.paymentPhone || "",
  created_at: toIsoString(order.createdAt) || new Date().toISOString(),
  paid_at: toIsoString(order.paidAt),
  paid_via: order.paidVia,
  email_notified_at: toIsoString(order.emailNotifiedAt),
  customer_email_notified_at: toIsoString(order.customerEmailNotifiedAt),
  whatsapp_notified_at: toIsoString(order.whatsappNotifiedAt),
});

const fromOrderRow = (row: Record<string, unknown>): OrderRecord => ({
  reference: String(row.reference),
  status: String(row.status),
  currency: String(row.currency),
  amountMinor: Number(row.amount_minor),
  totals: (row.totals as OrderRecord["totals"]) || { subtotal: 0, deliveryFee: 0, total: 0 },
  items: Array.isArray(row.items) ? (row.items as OrderRecord["items"]) : [],
  customer: (row.customer as OrderRecord["customer"]) || {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    county: "",
  },
  delivery: (row.delivery as OrderRecord["delivery"]) || {
    deliveryDate: "",
    deliveryWindow: "",
    deliveryNotes: "",
  },
  paymentPhone: typeof row.payment_phone === "string" ? row.payment_phone : "",
  createdAt: toTimestamp(typeof row.created_at === "string" ? row.created_at : null) || Date.now(),
  paidAt: toTimestamp(typeof row.paid_at === "string" ? row.paid_at : null),
  paidVia: typeof row.paid_via === "string" ? row.paid_via : null,
  emailNotifiedAt: toTimestamp(typeof row.email_notified_at === "string" ? row.email_notified_at : null),
  customerEmailNotifiedAt: toTimestamp(
    typeof row.customer_email_notified_at === "string" ? row.customer_email_notified_at : null
  ),
  whatsappNotifiedAt: toTimestamp(
    typeof row.whatsapp_notified_at === "string" ? row.whatsapp_notified_at : null
  ),
});

const getOrderByReference = async (reference: string) => {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (error) throw new Error(`Unable to load order: ${error.message}`);
  return data ? fromOrderRow(data as Record<string, unknown>) : null;
};

const upsertOrder = async (order: OrderRecord) => {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .upsert(toOrderRow(order), { onConflict: "reference" })
    .select("*")
    .single();

  if (error) throw new Error(`Unable to save order: ${error.message}`);
  return fromOrderRow(data as Record<string, unknown>);
};

export const assertCheckoutPayload = async (payload: Record<string, unknown>) => {
  const customProducts = await getCustomProductsMap();
  const customer = (payload.customer as Record<string, string>) || {};
  const delivery = (payload.delivery as Record<string, string>) || {};
  const items = normalizeItems(payload.items, customProducts);

  if (items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const requiredCustomerFields = [
    customer.fullName,
    customer.email,
    customer.phone,
    customer.address,
    customer.city,
    customer.county,
  ];

  if (!requiredCustomerFields.every(isNonEmptyString)) {
    throw new Error("Customer details are incomplete.");
  }

  if (!isNonEmptyString(delivery.deliveryDate) || !isNonEmptyString(delivery.deliveryWindow)) {
    throw new Error("Delivery details are incomplete.");
  }

  return {
    customProducts,
    customer: {
      fullName: customer.fullName.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      county: customer.county.trim(),
    },
    delivery: {
      deliveryDate: delivery.deliveryDate.trim(),
      deliveryWindow: delivery.deliveryWindow.trim(),
      deliveryNotes: isNonEmptyString(delivery.deliveryNotes) ? delivery.deliveryNotes.trim() : "",
    },
    paymentPhone: isNonEmptyString(payload.paymentPhone) ? payload.paymentPhone.trim() : "",
    items,
  };
};

export const createCheckoutSession = async (payload: Record<string, unknown>) => {
  const parsed = await assertCheckoutPayload(payload);
  const orderItems = buildOrderItemSnapshots(parsed.items, parsed.customProducts);
  const totals = computeTotals(orderItems, parsed.customProducts);
  const reference = createReference();
  const amountMinor = Math.round(totals.total * 100);

  const data = await paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      reference,
      email: parsed.customer.email,
      amount: amountMinor,
      currency: PAYSTACK_CURRENCY,
      callback_url: PAYSTACK_CALLBACK_URL,
      metadata: {
        customer: parsed.customer,
        delivery: parsed.delivery,
        paymentPhone: parsed.paymentPhone || parsed.customer.phone,
        items: orderItems,
        itemsSnapshot: orderItems,
        lineItems: buildLineItems(orderItems, parsed.customProducts),
        totals,
      },
    }),
  });

  await upsertOrder({
    reference,
    status: "pending",
    currency: PAYSTACK_CURRENCY,
    amountMinor,
    totals,
    items: orderItems,
    customer: parsed.customer,
    delivery: parsed.delivery,
    paymentPhone: parsed.paymentPhone || parsed.customer.phone,
    createdAt: Date.now(),
    paidAt: null,
    paidVia: null,
    emailNotifiedAt: null,
    customerEmailNotifiedAt: null,
    whatsappNotifiedAt: null,
  });

  return {
    authorizationUrl: data.authorization_url,
    accessCode: data.access_code,
    reference,
  };
};

const recoverOrderFromTransaction = async (transaction: Record<string, any>, source: string) => {
  const customProducts = await getCustomProductsMap();
  const metadata =
    transaction?.metadata && typeof transaction.metadata === "object" ? transaction.metadata : {};

  let items = normalizeItems(metadata.itemsSnapshot, customProducts);
  if (items.length === 0) items = normalizeItems(metadata.items, customProducts);
  if (items.length === 0) items = normalizeItems(metadata.lineItems, customProducts);

  const amountMinor = Number(transaction.amount);
  const customer = {
    fullName: metadata.customer?.fullName || "Unknown Customer",
    email: metadata.customer?.email || transaction.customer?.email || "unknown@example.com",
    phone: metadata.customer?.phone || "",
    address: metadata.customer?.address || "",
    city: metadata.customer?.city || "",
    county: metadata.customer?.county || "",
  };
  const delivery = {
    deliveryDate: metadata.delivery?.deliveryDate || "",
    deliveryWindow: metadata.delivery?.deliveryWindow || "",
    deliveryNotes: metadata.delivery?.deliveryNotes || "",
  };

  return {
    reference: String(transaction.reference),
    status: "paid",
    currency: String(transaction.currency || PAYSTACK_CURRENCY),
    amountMinor,
    totals: normalizeTotals(items, amountMinor, customProducts),
    items: buildOrderItemSnapshots(items, customProducts),
    customer,
    delivery,
    paymentPhone: metadata.paymentPhone || customer.phone,
    createdAt: Date.now(),
    paidAt: Date.now(),
    paidVia: source,
    emailNotifiedAt: null,
    customerEmailNotifiedAt: null,
    whatsappNotifiedAt: null,
  } satisfies OrderRecord;
};

const notifyOrderEmails = async (order: OrderRecord) => {
  const customProducts = await getCustomProductsMap();
  const tasks: Promise<void>[] = [];

  if (SELLER_NOTIFY_EMAIL && !order.emailNotifiedAt) {
    tasks.push(
      sendPlainTextEmail({
        to: SELLER_NOTIFY_EMAIL,
        subject: `Paid order ${order.reference}`,
        text: createOrderMessage(order, customProducts),
        html: createOrderEmailHtml(
          "New paid order received",
          `Reference: ${order.reference}`,
          order,
          customProducts
        ),
        replyTo: order.customer.email,
      }).then(() => {
        order.emailNotifiedAt = Date.now();
      })
    );
  }

  if (isNonEmptyString(order.customer.email) && !order.customerEmailNotifiedAt) {
    tasks.push(
      sendPlainTextEmail({
        to: order.customer.email,
        subject: `Order confirmed ${order.reference}`,
        text: createCustomerOrderMessage(order, customProducts),
        html: createOrderEmailHtml(
          "Order confirmed",
          "Your payment has been confirmed and we have received your order.",
          order,
          customProducts
        ),
        replyTo: SELLER_NOTIFY_EMAIL,
      }).then(() => {
        order.customerEmailNotifiedAt = Date.now();
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[notify] order email failed:", result.reason);
    }
  }
};

export const markOrderPaid = async (transaction: Record<string, any>, source: string) => {
  const reference = String(transaction.reference || "");
  if (!reference) throw new Error("Missing transaction reference.");

  const amountMinor = Number(transaction.amount);
  const currency = String(transaction.currency || "");
  if (!Number.isFinite(amountMinor) || !currency) {
    throw new Error("Invalid transaction payload.");
  }

  let order = await getOrderByReference(reference);

  if (!order) {
    order = await recoverOrderFromTransaction(transaction, source);
  } else {
    if (order.amountMinor !== amountMinor || order.currency !== currency) {
      throw new Error("Transaction amount mismatch.");
    }

    if (order.status !== "paid") {
      order.status = "paid";
      order.paidAt = Date.now();
      order.paidVia = source;
    }
  }

  order = await upsertOrder(order);
  await notifyOrderEmails(order);
  order = await upsertOrder(order);

  return {
    paid: true,
    reference: order.reference,
    status: "success",
    amount: order.amountMinor / 100,
    currency: order.currency,
    totals: order.totals,
    customer: order.customer,
    message: "Payment verified.",
  };
};

export const verifyPaymentByReference = async (reference: string) => {
  const transaction = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
  });

  const paid = transaction.status === "success";
  const existingOrder = await getOrderByReference(reference);

  if (paid) {
    return markOrderPaid(transaction, "verify");
  }

  if (
    existingOrder &&
    (existingOrder.amountMinor !== Number(transaction.amount) ||
      existingOrder.currency !== String(transaction.currency))
  ) {
    throw new Error("Transaction amount mismatch.");
  }

  return {
    paid: false,
    reference: String(transaction.reference),
    status: String(transaction.status),
    amount: Number(transaction.amount) / 100,
    currency: String(transaction.currency),
    totals: existingOrder?.totals || null,
    customer: existingOrder?.customer || null,
    message: "Payment is not successful.",
  };
};

export const verifyPaystackWebhookSignature = async (signature: string, rawBody: string) => {
  if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not set.");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(PAYSTACK_SECRET_KEY),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const digest = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return digest === signature;
};
