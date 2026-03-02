import crypto from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import nodemailer from "nodemailer";
import { config as loadEnv } from "dotenv";
import { DELIVERY_FEE, PRODUCT_NAME_BY_ID, PRODUCT_PRICE_BY_ID } from "./catalog.js";

const serverDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(serverDir, "..");
const rootEnvPath = resolve(projectRoot, ".env");
const serverEnvPath = resolve(serverDir, ".env");

if (existsSync(rootEnvPath)) {
  loadEnv({ path: rootEnvPath });
}
if (existsSync(serverEnvPath)) {
  // Keep hosting platform/runtime variables (for example PORT) intact.
  loadEnv({ path: serverEnvPath });
}

const PORT = Number(process.env.PORT || 8787);
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CURRENCY = process.env.PAYSTACK_CURRENCY || "KES";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const CORS_ORIGINS = process.env.CORS_ORIGINS || FRONTEND_URL;
const PAYSTACK_CALLBACK_URL =
  process.env.PAYSTACK_CALLBACK_URL || `${FRONTEND_URL}/checkout/verify`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_SESSION_TTL_MS = Number(process.env.ADMIN_SESSION_TTL_MS || 1000 * 60 * 60 * 8);
const SELLER_NOTIFY_EMAIL = (process.env.SELLER_NOTIFY_EMAIL || "").trim();
const WHATSAPP_WEBHOOK_URL = (process.env.WHATSAPP_WEBHOOK_URL || "").trim();
const WHATSAPP_ACCESS_TOKEN = (process.env.WHATSAPP_ACCESS_TOKEN || "").trim();
const WHATSAPP_PHONE_NUMBER_ID = (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
const WHATSAPP_RECIPIENT_PHONE = (process.env.WHATSAPP_RECIPIENT_PHONE || "").trim();
const WHATSAPP_API_VERSION = (process.env.WHATSAPP_API_VERSION || "v23.0").trim();
const SMTP_HOST = (process.env.SMTP_HOST || "")
  .trim()
  .replace(/,+$/g, "");
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = (process.env.SMTP_USER || "").trim();
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "no-reply@dantesmedia.local";
const BREVO_API_KEY = (process.env.BREVO_API_KEY || "").trim();
const CUSTOM_PRODUCTS_PATH = resolve(process.cwd(), "server/data/custom-products.json");

const app = express();
const orders = new Map();
const adminSessions = new Map();
const allowedOrigins = CORS_ORIGINS.split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const emailConfigured = Boolean(
  SELLER_NOTIFY_EMAIL && SMTP_HOST && SMTP_USER && SMTP_PASS
);
const mailTransporter = emailConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;
const whatsappCloudConfigured = Boolean(
  WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_RECIPIENT_PHONE
);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const sanitizeSpecs = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 10);
};

const parseCustomProduct = (payload) => {
  const name = typeof payload?.name === "string" ? payload.name.trim() : "";
  if (!name) {
    throw new Error("Product name is required.");
  }

  const explicitId =
    typeof payload?.id === "string" && payload.id.trim().length > 0
      ? payload.id.trim()
      : "";
  const id = toSlug(explicitId || name);
  if (!id) {
    throw new Error("Product id is invalid.");
  }

  const price = Number(payload?.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Price must be a positive number.");
  }

  const category =
    typeof payload?.category === "string" && payload.category.trim().length > 0
      ? payload.category.trim()
      : "";
  if (!category) {
    throw new Error("Category is required.");
  }

  const shortDesc =
    typeof payload?.shortDesc === "string" && payload.shortDesc.trim().length > 0
      ? payload.shortDesc.trim()
      : "";
  if (!shortDesc) {
    throw new Error("Short description is required.");
  }

  const image =
    typeof payload?.image === "string" && payload.image.trim().length > 0
      ? payload.image.trim()
      : "/assets/consultacy.jpg";

  return {
    id,
    name,
    category,
    shortDesc,
    price,
    specs: sanitizeSpecs(payload?.specs),
    image,
    featured: Boolean(payload?.featured),
    createdAt: Date.now(),
  };
};

const loadCustomProducts = () => {
  if (!existsSync(CUSTOM_PRODUCTS_PATH)) return new Map();

  try {
    const raw = readFileSync(CUSTOM_PRODUCTS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Map();

    const map = new Map();
    for (const item of parsed) {
      try {
        const product = parseCustomProduct(item);
        map.set(product.id, {
          ...product,
          createdAt:
            Number.isFinite(Number(item?.createdAt)) && Number(item.createdAt) > 0
              ? Number(item.createdAt)
              : product.createdAt,
        });
      } catch {
        // Skip invalid entries and keep loading.
      }
    }
    return map;
  } catch (error) {
    console.error("[catalog] failed to load custom products:", error);
    return new Map();
  }
};

const customProducts = loadCustomProducts();

const normalizeProductId = (value) =>
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
  Object.keys(PRODUCT_PRICE_BY_ID).reduce((map, id) => {
    map[normalizeProductId(id)] = id;
    return map;
  }, {})
);

const resolveProductId = (rawId) => {
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

const persistCustomProducts = () => {
  try {
    mkdirSync(dirname(CUSTOM_PRODUCTS_PATH), { recursive: true });
    const serialized = JSON.stringify(
      Array.from(customProducts.values()).sort((a, b) => a.name.localeCompare(b.name)),
      null,
      2
    );
    writeFileSync(CUSTOM_PRODUCTS_PATH, serialized, "utf8");
  } catch (error) {
    console.error("[catalog] failed to persist custom products:", error);
  }
};

const getProductPrice = (id) => {
  const resolvedId = resolveProductId(id);
  const knownPrice = PRODUCT_PRICE_BY_ID[resolvedId];
  if (typeof knownPrice === "number") return knownPrice;
  const custom = customProducts.get(resolvedId);
  return typeof custom?.price === "number" ? custom.price : undefined;
};

const getProductName = (id) => {
  const resolvedId = resolveProductId(id);
  return PRODUCT_NAME_BY_ID[resolvedId] || customProducts.get(resolvedId)?.name || resolvedId || id;
};

const normalizeItemCollection = (items) => {
  if (Array.isArray(items)) return items;
  if (isNonEmptyString(items)) {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return Object.values(parsed);
    } catch {
      return [];
    }
  }
  if (items && typeof items === "object") {
    return Object.values(items);
  }
  return [];
};

const normalizeItems = (items) => {
  const entries = normalizeItemCollection(items);
  const normalized = [];
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
    const id = resolveProductId(rawId);
    const quantity = Number(item?.quantity ?? item?.qty ?? item?.count);
    if (!id || !Number.isInteger(quantity) || quantity <= 0) {
      continue;
    }
    normalized.push({ id, quantity });
  }
  return normalized;
};

const computeTotals = (items) => {
  let subtotal = 0;
  for (const item of items) {
    const price = getProductPrice(item.id);
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

const toMinorUnits = (amountMajor) => Math.round(amountMajor * 100);

const normalizeTotals = (items, amountMinor) => {
  try {
    return computeTotals(items);
  } catch {
    return {
      subtotal: amountMinor / 100,
      deliveryFee: 0,
      total: amountMinor / 100,
    };
  }
};

const buildLineItems = (items) =>
  items.map((item) => {
    const unitPrice = getProductPrice(item.id);
    const quantity = item.quantity;
    const lineTotal = typeof unitPrice === "number" ? unitPrice * quantity : null;
    return {
      id: item.id,
      name: getProductName(item.id),
      quantity,
      unitPrice: unitPrice ?? null,
      lineTotal,
    };
  });

const formatAmount = (value) => `KES ${value.toLocaleString("en-KE")}`;

const toOrderResponse = (order) => ({
  reference: order.reference,
  status: order.status,
  currency: order.currency,
  amount: order.amountMinor / 100,
  totals: order.totals,
  items: buildLineItems(order.items),
  customer: order.customer,
  delivery: order.delivery,
  paymentPhone: order.paymentPhone,
  createdAt: order.createdAt,
  paidAt: order.paidAt || null,
  paidVia: order.paidVia || null,
  notifications: {
    emailNotifiedAt: order.emailNotifiedAt || null,
    whatsappNotifiedAt: order.whatsappNotifiedAt || null,
  },
});

const createReference = () => {
  const token = crypto.randomBytes(5).toString("hex");
  return `DM-${Date.now()}-${token}`;
};

const paystackRequest = async (path, init = {}) => {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
  }

  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const rawBody = await response.text();
  let payload = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error(
        `Paystack returned an invalid response (${response.status}). Check network and credentials.`
      );
    }
  }

  if (!response.ok || payload?.status !== true) {
    const message = payload?.message || `Paystack request failed (${response.status}).`;
    throw new Error(message);
  }

  if (!payload?.data) {
    throw new Error("Paystack response was missing transaction data.");
  }

  return payload.data;
};

const assertCheckoutPayload = (payload) => {
  const customer = payload?.customer || {};
  const delivery = payload?.delivery || {};
  const items = normalizeItems(payload?.items);

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
      deliveryNotes: isNonEmptyString(delivery.deliveryNotes)
        ? delivery.deliveryNotes.trim()
        : "",
    },
    paymentPhone: isNonEmptyString(payload?.paymentPhone)
      ? payload.paymentPhone.trim()
      : "",
    items,
  };
};

const createOrderMessage = (order) => {
  const itemLines = buildLineItems(order.items)
    .map((item) => {
      const lineAmount =
        typeof item.lineTotal === "number" ? formatAmount(item.lineTotal) : "N/A";
      return `- ${item.name} (x${item.quantity}) - ${lineAmount}`;
    })
    .join("\n");

  return [
    `New paid order: ${order.reference}`,
    `Amount: ${formatAmount(order.amountMinor / 100)} ${order.currency}`,
    `Customer: ${order.customer.fullName} (${order.customer.email}, ${order.customer.phone})`,
    `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.county}`,
    `Delivery: ${order.delivery.deliveryDate} | ${order.delivery.deliveryWindow}`,
    order.delivery.deliveryNotes ? `Delivery notes: ${order.delivery.deliveryNotes}` : "",
    "Items:",
    itemLines,
  ]
    .filter(Boolean)
    .join("\n");
};

const notifyViaEmail = async (order) => {
  if (!SELLER_NOTIFY_EMAIL || order.emailNotifiedAt) return false;

  const subject = `Paid order ${order.reference}`;
  const text = createOrderMessage(order);

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: SMTP_FROM,
        to: SELLER_NOTIFY_EMAIL,
        subject,
        text,
      });
      order.emailNotifiedAt = Date.now();
      return true;
    } catch (error) {
      console.error("[notify] smtp send failed:", error);
    }
  }

  if (BREVO_API_KEY) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: SMTP_FROM },
        to: [{ email: SELLER_NOTIFY_EMAIL }],
        subject,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Brevo email API failed (${response.status}): ${body}`);
    }

    order.emailNotifiedAt = Date.now();
    return true;
  }

  return false;
};

const notifyViaWhatsappWebhook = async (order) => {
  if (!WHATSAPP_WEBHOOK_URL || order.whatsappNotifiedAt) return false;

  const response = await fetch(WHATSAPP_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "order.paid",
      reference: order.reference,
      message: createOrderMessage(order),
      order: toOrderResponse(order),
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp webhook failed with status ${response.status}`);
  }

  order.whatsappNotifiedAt = Date.now();
  return true;
};

const toWhatsappRecipient = (value) => {
  const digits = typeof value === "string" ? value.replace(/\D+/g, "") : "";
  return digits;
};

const notifyViaWhatsappCloud = async (order) => {
  if (!whatsappCloudConfigured || order.whatsappNotifiedAt) return false;

  const recipient = toWhatsappRecipient(WHATSAPP_RECIPIENT_PHONE);
  if (!recipient) {
    throw new Error("WHATSAPP_RECIPIENT_PHONE is invalid.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: {
          preview_url: false,
          body: createOrderMessage(order),
        },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WhatsApp Cloud API failed (${response.status}): ${body}`);
  }

  order.whatsappNotifiedAt = Date.now();
  return true;
};

const notifyViaWhatsapp = async (order) => {
  if (order.whatsappNotifiedAt) return false;

  if (whatsappCloudConfigured) {
    try {
      return await notifyViaWhatsappCloud(order);
    } catch (error) {
      console.error("[notify] whatsapp cloud send failed:", error);
    }
  }

  if (WHATSAPP_WEBHOOK_URL) {
    return notifyViaWhatsappWebhook(order);
  }

  return false;
};

const notifySeller = async (order) => {
  const tasks = [];
  if (!order.emailNotifiedAt) tasks.push(notifyViaEmail(order));
  if (!order.whatsappNotifiedAt) tasks.push(notifyViaWhatsapp(order));

  if (tasks.length === 0) return;

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[notify] seller notification failed:", result.reason);
    }
  }
};

const recoverOrderFromTransaction = (transaction, source) => {
  const metadata =
    transaction?.metadata && typeof transaction.metadata === "object"
      ? transaction.metadata
      : {};

  let items = normalizeItems(metadata.items);
  if (items.length === 0) {
    items = normalizeItems(metadata.lineItems);
  }
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
    customer,
    delivery,
    paymentPhone: metadata.paymentPhone || customer.phone,
    items,
    reference: transaction.reference,
    amountMinor,
    currency: transaction.currency || PAYSTACK_CURRENCY,
    totals: normalizeTotals(items, amountMinor),
    status: "paid",
    createdAt: Date.now(),
    paidAt: Date.now(),
    paidVia: source,
  };
};

const markOrderPaid = async (transaction, source) => {
  const reference = transaction.reference;
  if (!isNonEmptyString(reference)) {
    throw new Error("Missing transaction reference.");
  }
  const amount = Number(transaction.amount);
  const currency = transaction.currency;
  if (!Number.isFinite(amount) || !isNonEmptyString(currency)) {
    throw new Error("Invalid transaction payload.");
  }
  let order = orders.get(reference);

  if (!order) {
    order = recoverOrderFromTransaction(transaction, source);
    orders.set(reference, order);
  } else {
    if (order.amountMinor !== amount || order.currency !== currency) {
      throw new Error("Transaction amount mismatch.");
    }
    if (order.status !== "paid") {
      order.status = "paid";
      order.paidAt = Date.now();
      order.paidVia = source;
    }
  }

  await notifySeller(order);
  return order;
};

const adminCredentialsConfigured =
  isNonEmptyString(ADMIN_EMAIL) && isNonEmptyString(ADMIN_PASSWORD);

const readAdminBearerToken = (req) => {
  const authorization = req.header("authorization");
  if (!isNonEmptyString(authorization)) return "";
  const [scheme, token = ""] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return "";
  return token.trim();
};

const purgeExpiredAdminSessions = () => {
  const now = Date.now();
  for (const [token, expiresAt] of adminSessions.entries()) {
    if (expiresAt <= now) {
      adminSessions.delete(token);
    }
  }
};

const requireAdminAuth = (req, res, next) => {
  if (!adminCredentialsConfigured) {
    return res.status(503).json({ message: "Admin credentials are not configured." });
  }

  const token = readAdminBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  purgeExpiredAdminSessions();
  const expiresAt = adminSessions.get(token);
  if (!expiresAt || expiresAt <= Date.now()) {
    if (expiresAt) adminSessions.delete(token);
    return res.status(401).json({ message: "Session expired. Login again." });
  }

  req.adminToken = token;
  return next();
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, allowedOrigins.includes(origin));
    },
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.get("/", (_req, res) => {
  res.status(200).send("Dantes Media API is running.");
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    paystackConfigured: Boolean(PAYSTACK_SECRET_KEY),
    adminConfigured: adminCredentialsConfigured,
    notificationChannels: {
      email: Boolean(SELLER_NOTIFY_EMAIL && (mailTransporter || BREVO_API_KEY)),
      emailViaSmtp: Boolean(SELLER_NOTIFY_EMAIL && mailTransporter),
      emailViaBrevoApi: Boolean(SELLER_NOTIFY_EMAIL && BREVO_API_KEY),
      whatsapp: Boolean(whatsappCloudConfigured || WHATSAPP_WEBHOOK_URL),
      whatsappViaCloudApi: whatsappCloudConfigured,
      whatsappViaWebhook: Boolean(WHATSAPP_WEBHOOK_URL),
    },
  });
});

app.post(
  "/api/paystack/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ message: "PAYSTACK_SECRET_KEY is not set." });
    }

    const signature = req.header("x-paystack-signature");
    const digest = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (signature !== digest) {
      return res.status(401).json({ message: "Invalid webhook signature." });
    }

    let event;
    try {
      event = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({ message: "Invalid webhook payload." });
    }

    if (event?.event === "charge.success") {
      try {
        await markOrderPaid(event.data || {}, "webhook");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to process webhook.";
        console.error("[webhook] charge.success failed:", message);
      }
    }

    return res.json({ received: true });
  }
);

app.use(express.json());

app.get("/api/products/custom", (_req, res) => {
  const products = Array.from(customProducts.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return res.json({
    count: products.length,
    products,
  });
});

app.post("/api/admin/login", (req, res) => {
  if (!adminCredentialsConfigured) {
    return res.status(503).json({ message: "Admin credentials are not configured." });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const emailMatches = email.toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
  const passwordMatches = password === ADMIN_PASSWORD;
  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  purgeExpiredAdminSessions();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  adminSessions.set(token, expiresAt);

  return res.json({
    token,
    expiresAt,
    expiresInSeconds: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  });
});

app.post("/api/admin/logout", requireAdminAuth, (req, res) => {
  if (req.adminToken) {
    adminSessions.delete(req.adminToken);
  }
  return res.json({ ok: true });
});

app.get("/api/admin/orders", requireAdminAuth, (req, res) => {
  const statusFilter = typeof req.query.status === "string" ? req.query.status : "all";

  const allOrders = Array.from(orders.values())
    .filter((order) => (statusFilter === "all" ? true : order.status === statusFilter))
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((order) => toOrderResponse(order));

  return res.json({
    count: allOrders.length,
    orders: allOrders,
  });
});

app.get("/api/admin/orders/:reference", requireAdminAuth, (req, res) => {
  const order = orders.get(req.params.reference);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }
  return res.json({ order: toOrderResponse(order) });
});

app.get("/api/admin/products", requireAdminAuth, (_req, res) => {
  const products = Array.from(customProducts.values()).sort((a, b) =>
    a.createdAt - b.createdAt
  );
  return res.json({
    count: products.length,
    products,
  });
});

app.post("/api/admin/products", requireAdminAuth, (req, res) => {
  try {
    const product = parseCustomProduct(req.body);
    if (PRODUCT_PRICE_BY_ID[product.id] || PRODUCT_NAME_BY_ID[product.id]) {
      return res.status(409).json({ message: "A base catalog product with this id already exists." });
    }
    if (customProducts.has(product.id)) {
      return res.status(409).json({ message: "A custom product with this id already exists." });
    }

    customProducts.set(product.id, product);
    persistCustomProducts();

    return res.status(201).json({
      message: "Product created.",
      product,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product.";
    return res.status(400).json({ message });
  }
});

app.get("/api/admin/sold-goods", requireAdminAuth, (_req, res) => {
  const paidOrders = Array.from(orders.values()).filter((order) => order.status === "paid");
  const byProduct = new Map();

  for (const order of paidOrders) {
    for (const item of order.items) {
      const existing = byProduct.get(item.id) || {
        id: item.id,
        name: getProductName(item.id),
        quantitySold: 0,
        revenue: 0,
        hasUnknownPricing: false,
      };
      const unitPrice = getProductPrice(item.id);

      existing.quantitySold += item.quantity;
      if (typeof unitPrice === "number") {
        existing.revenue += unitPrice * item.quantity;
      } else {
        existing.hasUnknownPricing = true;
      }

      byProduct.set(item.id, existing);
    }
  }

  const goods = Array.from(byProduct.values()).sort((a, b) => {
    if (b.quantitySold !== a.quantitySold) return b.quantitySold - a.quantitySold;
    return b.revenue - a.revenue;
  });

  return res.json({
    count: goods.length,
    ordersPaid: paidOrders.length,
    goods,
  });
});

app.post("/api/paystack/initialize", async (req, res) => {
  try {
    const parsed = assertCheckoutPayload(req.body);
    const totals = computeTotals(parsed.items);
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
          items: parsed.items,
          lineItems: buildLineItems(parsed.items),
          totals,
        },
      }),
    });

    orders.set(reference, {
      ...parsed,
      reference,
      amountMinor,
      currency: PAYSTACK_CURRENCY,
      totals,
      status: "pending",
      createdAt: Date.now(),
      paidAt: null,
      paidVia: null,
      emailNotifiedAt: null,
      whatsappNotifiedAt: null,
    });

    return res.json({
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not be initialized.";
    return res.status(400).json({ message });
  }
});

app.get("/api/paystack/verify/:reference", async (req, res) => {
  try {
    const reference = req.params.reference;
    if (!isNonEmptyString(reference)) {
      return res.status(400).json({ message: "Missing transaction reference." });
    }

    const transaction = await paystackRequest(
      `/transaction/verify/${encodeURIComponent(reference)}`,
      { method: "GET" }
    );

    const amountMinor = Number(transaction.amount);
    const currency = transaction.currency;
    const paid = transaction.status === "success";
    let order = orders.get(reference);

    if (paid) {
      try {
        order = await markOrderPaid(transaction, "verify");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to finalize order.";
        return res.status(409).json({ paid: false, message });
      }
    } else if (order && (order.amountMinor !== amountMinor || order.currency !== currency)) {
      return res.status(409).json({
        paid: false,
        message: "Transaction amount mismatch.",
      });
    }

    return res.json({
      paid,
      reference: transaction.reference,
      status: transaction.status,
      amount: amountMinor / 100,
      currency,
      totals: order?.totals || null,
      customer: order?.customer || null,
      message: paid ? "Payment verified." : "Payment is not successful.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment.";
    return res.status(400).json({ paid: false, message });
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const isBodySyntaxError =
    error instanceof SyntaxError && Object.prototype.hasOwnProperty.call(error, "body");
  const status =
    typeof error?.status === "number" ? error.status : isBodySyntaxError ? 400 : 500;
  const message =
    status >= 500
      ? "Internal server error."
      : error?.message || "Request could not be processed.";

  if (req.path.startsWith("/api")) {
    return res.status(status).json({ message });
  }

  return next(error);
});

const pruneOldOrders = () => {
  const ttlMs = 6 * 60 * 60 * 1000;
  const now = Date.now();
  for (const [reference, order] of orders.entries()) {
    if (now - order.createdAt > ttlMs) {
      orders.delete(reference);
    }
  }
};

setInterval(pruneOldOrders, 30 * 60 * 1000).unref();

app.listen(PORT, () => {
  console.log(`[paystack-api] listening on http://localhost:${PORT}`);
  if (!PAYSTACK_SECRET_KEY) {
    console.warn("[paystack-api] PAYSTACK_SECRET_KEY is not set. Payment endpoints will fail.");
  }
  if (!adminCredentialsConfigured) {
    console.warn(
      "[paystack-api] ADMIN_EMAIL and/or ADMIN_PASSWORD is not set. Admin endpoints are disabled."
    );
  }
  if (!SELLER_NOTIFY_EMAIL && !whatsappCloudConfigured && !WHATSAPP_WEBHOOK_URL) {
    console.warn(
      "[paystack-api] seller notifications are not configured. Set SELLER_NOTIFY_EMAIL and/or WhatsApp envs."
    );
  }
});
