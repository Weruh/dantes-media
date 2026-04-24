import type { User } from "@supabase/supabase-js";
import { assertSupabaseConfigured, isAdminUser, supabase } from "./supabase";

type CustomProductRow = {
  id: string;
  name: string;
  category: string;
  short_desc: string;
  price: number;
  specs: string[] | null;
  image: string | null;
  featured: boolean | null;
  created_at: string;
};

type OrderRow = {
  reference: string;
  status: string;
  currency: string;
  amount_minor: number;
  totals: {
    subtotal?: number;
    deliveryFee?: number;
    total?: number;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    name?: string;
    unitPrice?: number | null;
    image?: string;
    category?: string;
  }> | null;
  customer: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    county?: string;
  } | null;
  delivery: {
    deliveryDate?: string;
    deliveryWindow?: string;
    deliveryNotes?: string;
  } | null;
  payment_phone: string | null;
  created_at: string;
  paid_at: string | null;
  paid_via: string | null;
};

type QuoteRequestRow = {
  id: string;
  full_name: string;
  company: string | null;
  email: string;
  phone: string;
  location: string;
  service_type: string;
  budget_range: string | null;
  message: string;
  created_at: string;
  notification_status: string | null;
  notification_error: string | null;
};

export type CustomProduct = {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  price: number;
  specs: string[];
  image: string;
  featured: boolean;
  createdAt: number;
};

export type OrderRecord = {
  reference: string;
  status: string;
  currency: string;
  amount: number;
  totals: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number | null;
    lineTotal: number | null;
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
};

export type QuoteRequest = {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  serviceType: string;
  budgetRange: string;
  message: string;
  createdAt: number;
  notificationStatus: string;
  notificationError: string;
};

export type SoldGood = {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
  hasUnknownPricing: boolean;
};

export type QuotePayload = {
  fullName: string;
  company?: string;
  email: string;
  phone: string;
  location: string;
  serviceType: string;
  budgetRange?: string;
  message: string;
};

export type CheckoutPayload = {
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
    deliveryNotes?: string;
  };
  paymentPhone?: string;
  items: Array<{
    id: string;
    quantity: number;
  }>;
};

const PRODUCT_IMAGE_BUCKET = "product-images";
const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

const toTimestamp = (value: string | null | undefined) => {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

const normalizeCustomProduct = (row: CustomProductRow): CustomProduct => ({
  id: row.id,
  name: row.name,
  category: row.category,
  shortDesc: row.short_desc,
  price: Number(row.price),
  specs: Array.isArray(row.specs) ? row.specs.filter(Boolean) : [],
  image: row.image || "/assets/consultacy.jpg",
  featured: Boolean(row.featured),
  createdAt: toTimestamp(row.created_at) || Date.now(),
});

const normalizeOrder = (row: OrderRow): OrderRecord => {
  const items = Array.isArray(row.items) ? row.items : [];
  return {
    reference: row.reference,
    status: row.status,
    currency: row.currency,
    amount: Number(row.amount_minor) / 100,
    totals: {
      subtotal: Number(row.totals?.subtotal || 0),
      deliveryFee: Number(row.totals?.deliveryFee || 0),
      total: Number(row.totals?.total || 0),
    },
    items: items.map((item) => {
      const unitPrice =
        typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice)
          ? item.unitPrice
          : null;
      return {
        id: item.id,
        name: item.name || item.id,
        quantity: Number(item.quantity) || 0,
        unitPrice,
        lineTotal: unitPrice === null ? null : unitPrice * (Number(item.quantity) || 0),
      };
    }),
    customer: {
      fullName: row.customer?.fullName || "",
      email: row.customer?.email || "",
      phone: row.customer?.phone || "",
      address: row.customer?.address || "",
      city: row.customer?.city || "",
      county: row.customer?.county || "",
    },
    delivery: {
      deliveryDate: row.delivery?.deliveryDate || "",
      deliveryWindow: row.delivery?.deliveryWindow || "",
      deliveryNotes: row.delivery?.deliveryNotes || "",
    },
    paymentPhone: row.payment_phone || "",
    createdAt: toTimestamp(row.created_at) || Date.now(),
    paidAt: toTimestamp(row.paid_at),
    paidVia: row.paid_via || null,
  };
};

const normalizeQuoteRequest = (row: QuoteRequestRow): QuoteRequest => ({
  id: row.id,
  fullName: row.full_name,
  company: row.company || "",
  email: row.email,
  phone: row.phone,
  location: row.location,
  serviceType: row.service_type,
  budgetRange: row.budget_range || "",
  message: row.message,
  createdAt: toTimestamp(row.created_at) || Date.now(),
  notificationStatus: row.notification_status || "pending",
  notificationError: row.notification_error || "",
});

const assertAdminUser = async (): Promise<User> => {
  assertSupabaseConfigured();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user || !isAdminUser(user)) {
    throw new Error("Sign in with a Supabase admin account.");
  }

  return user;
};

const getFunctionErrorMessage = async (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    const context = (error as { context?: unknown }).context;

    if (context instanceof Response) {
      const response = context.clone();
      const payload = await response.json().catch(async () => {
        const text = await context.clone().text().catch(() => "");
        return text ? { message: text } : null;
      });

      if (payload && typeof payload === "object" && "message" in payload) {
        const message = String((payload as { message?: unknown }).message || "").trim();
        if (message) return message;
      }
    }

    if (error.message) return error.message;
  }

  return fallback;
};

export const signInAdmin = async (email: string, password: string) => {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    throw new Error("This account is not allowed to access the admin dashboard.");
  }

  return data;
};

export const signOutAdmin = async () => {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentAdminUser = async () => {
  assertSupabaseConfigured();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return isAdminUser(user) ? user : null;
};

export const loadCustomProducts = async () => {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("custom_products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data || []) as CustomProductRow[]).map(normalizeCustomProduct);
};

export const addCustomProduct = async (product: Omit<CustomProduct, "createdAt">) => {
  await assertAdminUser();

  const { data, error } = await supabase
    .from("custom_products")
    .insert({
      id: product.id,
      name: product.name,
      category: product.category,
      short_desc: product.shortDesc,
      price: product.price,
      specs: product.specs,
      image: product.image,
      featured: product.featured,
    })
    .select("*")
    .single();

  if (error) throw error;
  return normalizeCustomProduct(data as CustomProductRow);
};

export const uploadCustomProductImage = async (file: File, productId: string) => {
  await assertAdminUser();

  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Product image must be 5 MB or smaller.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const safeProductId = productId.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  const path = `${safeProductId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const loadOrders = async (status = "all") => {
  await assertAdminUser();

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data || []) as OrderRow[]).map(normalizeOrder);
};

export const loadPaidOrders = async () => {
  await assertAdminUser();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data || []) as OrderRow[]).map(normalizeOrder);
};

export const loadQuoteRequests = async () => {
  await assertAdminUser();
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data || []) as QuoteRequestRow[]).map(normalizeQuoteRequest);
};

export const buildSoldGoods = (orders: OrderRecord[]): SoldGood[] => {
  const byProduct = new Map<string, SoldGood>();

  for (const order of orders) {
    for (const item of order.items) {
      const current = byProduct.get(item.id) || {
        id: item.id,
        name: item.name,
        quantitySold: 0,
        revenue: 0,
        hasUnknownPricing: false,
      };

      current.quantitySold += item.quantity;
      if (typeof item.unitPrice === "number") {
        current.revenue += item.unitPrice * item.quantity;
      } else {
        current.hasUnknownPricing = true;
      }

      byProduct.set(item.id, current);
    }
  }

  return Array.from(byProduct.values()).sort((a, b) => {
    if (b.quantitySold !== a.quantitySold) return b.quantitySold - a.quantitySold;
    return b.revenue - a.revenue;
  });
};

export const submitQuoteRequest = async (payload: QuotePayload) => {
  assertSupabaseConfigured();
  const { data, error } = await supabase.functions.invoke("submit-quote", {
    body: payload,
  });

  if (error) throw new Error(await getFunctionErrorMessage(error, "Unable to submit quote request."));
  return (data || {}) as { message?: string };
};

export const createCheckoutSession = async (payload: CheckoutPayload) => {
  assertSupabaseConfigured();
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: payload,
  });

  if (error) throw new Error(await getFunctionErrorMessage(error, "Unable to initialize payment."));
  return (data || {}) as {
    authorizationUrl?: string;
    accessCode?: string;
    reference?: string;
    message?: string;
  };
};

export const verifyCheckoutPayment = async (reference: string) => {
  assertSupabaseConfigured();
  const { data, error } = await supabase.functions.invoke("verify-payment", {
    body: { reference },
  });

  if (error) throw new Error(await getFunctionErrorMessage(error, "Unable to verify payment."));
  return (data || {}) as {
    paid?: boolean;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    message?: string;
  };
};
