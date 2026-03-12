import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Section from "../components/Section";
import Card from "../components/Card";
import Alert from "../components/Alert";
import { Input, SelectField, Textarea } from "../components/Input";
import { Button } from "../components/Button";
import { createApiUrl, getApiBaseUrl } from "../utils/api";
import { parseJsonSafely } from "../utils/http";
import { defaultProductCategories } from "../data/catalogTypes";
import { resetCatalogCache } from "../data/productsApi";

type AdminOrder = {
  reference: string;
  status: "pending" | "paid" | string;
  currency: string;
  amount: number;
  totals: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  } | null;
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
  createdAt: number;
  paidAt: number | null;
  paidVia: string | null;
};

type SoldGood = {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
  hasUnknownPricing: boolean;
};

type AdminProduct = {
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

type ProductFormState = {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  price: string;
  specs: string;
  image: string;
  featured: boolean;
};

const formatCurrency = (currency: string, value: number) =>
  `${currency} ${value.toLocaleString("en-KE")}`;

const formatDateTime = (value: number | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const defaultProductForm = (): ProductFormState => ({
  id: "",
  name: "",
  category: defaultProductCategories[0] ?? "Accessories",
  shortDesc: "",
  price: "",
  specs: "",
  image: "",
  featured: false,
});

const ADMIN_TOKEN_STORAGE_KEY = "dantes-admin-token";

const AdminOrders = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminToken, setAdminToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
  });
  const [status, setStatus] = useState("paid");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [count, setCount] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [soldGoods, setSoldGoods] = useState<SoldGood[]>([]);
  const [paidOrdersCount, setPaidOrdersCount] = useState(0);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesLoaded, setSalesLoaded] = useState(false);
  const [salesError, setSalesError] = useState("");
  const [customProducts, setCustomProducts] = useState<AdminProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [authError, setAuthError] = useState("");
  const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState("");
  const [productSuccess, setProductSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  const requireToken = (token = adminToken) => {
    if (!token.trim()) {
      setAuthError("Login with admin email and password.");
      return false;
    }
    setAuthError("");
    return true;
  };

  const clearAuth = () => {
    setAdminToken("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
  };

  const loadOrders = async (token = adminToken) => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const response = await fetch(
        `${apiBase}/admin/orders?status=${encodeURIComponent(status)}`,
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );
      const payload = await parseJsonSafely<{
        message?: string;
        count?: number;
        orders?: AdminOrder[];
      }>(response);

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
        }
        throw new Error(payload?.message || "Unable to fetch orders.");
      }

      setCount(payload?.count || 0);
      setOrders(payload?.orders || []);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.message.toLowerCase().includes("session")) {
        clearAuth();
      }
      setOrdersError(
        fetchError instanceof Error ? fetchError.message : "Unable to fetch orders."
      );
    } finally {
      setOrdersLoading(false);
      setOrdersLoaded(true);
    }
  };

  const loadCustomProducts = async (token = adminToken) => {
    setCatalogLoading(true);
    setCatalogError("");

    try {
      const response = await fetch(`${apiBase}/admin/products`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });
      const payload = await parseJsonSafely<{
        message?: string;
        products?: AdminProduct[];
      }>(response);

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
        }
        throw new Error(payload?.message || "Unable to fetch products.");
      }

      setCustomProducts(payload?.products || []);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.message.toLowerCase().includes("session")) {
        clearAuth();
      }
      setCatalogError(
        fetchError instanceof Error ? fetchError.message : "Unable to fetch products."
      );
    } finally {
      setCatalogLoading(false);
      setCatalogLoaded(true);
    }
  };

  const loadSoldGoods = async (token = adminToken) => {
    setSalesLoading(true);
    setSalesError("");

    try {
      const response = await fetch(`${apiBase}/admin/sold-goods`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });
      const payload = await parseJsonSafely<{
        message?: string;
        ordersPaid?: number;
        goods?: SoldGood[];
      }>(response);

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
        }
        throw new Error(payload?.message || "Unable to fetch sold goods.");
      }

      setPaidOrdersCount(payload?.ordersPaid || 0);
      setSoldGoods(payload?.goods || []);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.message.toLowerCase().includes("session")) {
        clearAuth();
      }
      setSalesError(
        fetchError instanceof Error ? fetchError.message : "Unable to fetch sold goods."
      );
    } finally {
      setSalesLoading(false);
      setSalesLoaded(true);
    }
  };

  const loadDashboard = async (token = adminToken) => {
    if (!requireToken(token)) return;
    await Promise.all([loadOrders(token), loadCustomProducts(token), loadSoldGoods(token)]);
  };

  const handleLogin = async () => {
    if (!adminEmail.trim() || !adminPassword) {
      setAuthError("Enter admin email and password.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${apiBase}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: adminEmail.trim(),
          password: adminPassword,
        }),
      });

      const payload = await parseJsonSafely<{ message?: string; token?: string }>(response);
      if (!response.ok || !payload?.token) {
        throw new Error(payload?.message || "Unable to login.");
      }

      setAdminToken(payload.token);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, payload.token);
      }
      setAdminPassword("");
      await loadDashboard(payload.token);
    } catch (loginError) {
      clearAuth();
      setAuthError(loginError instanceof Error ? loginError.message : "Unable to login.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (adminToken.trim()) {
      try {
        await fetch(createApiUrl("/admin/logout"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken.trim()}`,
          },
        });
      } catch {
        // Clear local auth even if network request fails.
      }
    }
    clearAuth();
  };

  const setProductField = <K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K]
  ) => {
    setProductForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAddProduct = async () => {
    if (!requireToken()) return;

    setProductSaving(true);
    setProductError("");
    setProductSuccess("");

    try {
      const response = await fetch(`${apiBase}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken.trim()}`,
        },
        body: JSON.stringify({
          id: productForm.id,
          name: productForm.name,
          category: productForm.category,
          shortDesc: productForm.shortDesc,
          price: Number(productForm.price),
          image: productForm.image,
          featured: productForm.featured,
          specs: productForm.specs
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      });

      const payload = await parseJsonSafely<{ message?: string }>(response);
      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
        }
        throw new Error(payload?.message || "Unable to add product.");
      }

      setProductSuccess("Product added successfully.");
      setProductForm(defaultProductForm());
      resetCatalogCache();
      await Promise.all([loadCustomProducts(), loadSoldGoods()]);
    } catch (saveError) {
      setProductError(saveError instanceof Error ? saveError.message : "Unable to add product.");
    } finally {
      setProductSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Dantes Media</title>
      </Helmet>

      <Section
        eyebrow="Admin Console"
        title="Dashboard"
        subtitle="Add new products, review sold goods, and inspect order records."
      >
        <div className="space-y-6">
          <Card>
            {adminToken ? (
              <div className="space-y-4">
                <Alert tone="success">
                  Logged in as {adminEmail || "admin"}.
                </Alert>
                <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                  <SelectField
                    label="Status filter"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="all">All</option>
                  </SelectField>
                  <Button
                    type="button"
                    onClick={() => loadDashboard()}
                    disabled={ordersLoading || salesLoading || catalogLoading}
                  >
                    {ordersLoading || salesLoading || catalogLoading
                      ? "Loading..."
                      : "Load dashboard"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <Input
                  label="Admin email"
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder="Email"
                />
                <Input
                  label="Password"
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder="Enter password"
                />
                <Button type="button" onClick={handleLogin} disabled={authLoading}>
                  {authLoading ? "Signing in..." : "Login"}
                </Button>
              </div>
            )}
            {authError && (
              <Alert tone="error" className="mt-4">
                {authError}
              </Alert>
            )}
          </Card>

          {adminToken && (
            <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
                  Product Catalog
                </p>
                <h3 className="text-lg font-semibold text-ink-900">Add New Product</h3>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input
                label="Product name"
                value={productForm.name}
                onChange={(event) => setProductField("name", event.target.value)}
                placeholder="Automatic Boom Barrier"
              />
              <Input
                label="Product id (optional)"
                value={productForm.id}
                onChange={(event) => setProductField("id", event.target.value)}
                placeholder="auto-boom-barrier"
              />
              <SelectField
                label="Category"
                value={productForm.category}
                onChange={(event) => setProductField("category", event.target.value)}
              >
                {defaultProductCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </SelectField>
              <Input
                label="Price (KES)"
                type="number"
                min={1}
                value={productForm.price}
                onChange={(event) => setProductField("price", event.target.value)}
                placeholder="15000"
              />
              <Input
                label="Image URL or asset path"
                value={productForm.image}
                onChange={(event) => setProductField("image", event.target.value)}
                placeholder="/assets/new-product.png"
              />
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(event) => setProductField("featured", event.target.checked)}
                />
                Mark as featured product
              </label>
            </div>

            <div className="mt-4 grid gap-4">
              <Textarea
                label="Short description"
                value={productForm.shortDesc}
                onChange={(event) => setProductField("shortDesc", event.target.value)}
                placeholder="Access control barrier for secure parking areas."
              />
              <Textarea
                label="Specs (one per line)"
                value={productForm.specs}
                onChange={(event) => setProductField("specs", event.target.value)}
                placeholder={"24V motor\nRemote controls\nSafety sensors"}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button" onClick={handleAddProduct} disabled={productSaving}>
                {productSaving ? "Saving..." : "Add product"}
              </Button>
              {productSuccess && <Alert tone="success">{productSuccess}</Alert>}
            </div>

            {productError && (
              <Alert tone="error" className="mt-4">
                {productError}
              </Alert>
            )}

            {catalogError && (
              <Alert tone="error" className="mt-4">
                {catalogError}
              </Alert>
            )}

            {catalogLoaded && !catalogLoading && !catalogError && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-ink-900">
                  Custom products: {customProducts.length}
                </p>
                <div className="mt-3 space-y-2 text-sm text-ink-600">
                  {customProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-3">
                      <p>
                        {product.name} <span className="text-ink-400">({product.id})</span>
                      </p>
                      <p>{formatCurrency("KES", product.price)}</p>
                    </div>
                  ))}
                  {customProducts.length === 0 && (
                    <p className="text-ink-500">No custom products yet.</p>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
                  Sales
                </p>
                <h3 className="text-lg font-semibold text-ink-900">Sold Goods</h3>
              </div>
              {salesLoaded && !salesError && (
                <p className="text-sm text-ink-500">Paid orders tracked: {paidOrdersCount}</p>
              )}
            </div>

            {salesError && (
              <Alert tone="error" className="mt-4">
                {salesError}
              </Alert>
            )}

            {salesLoading ? (
              <p className="mt-4 text-sm text-ink-500">Loading sold goods...</p>
            ) : (
              <div className="mt-4 space-y-2 text-sm">
                {soldGoods.map((good) => (
                  <div
                    key={good.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-ink-900">{good.name}</p>
                      <p className="text-xs text-ink-500">Sold quantity: {good.quantitySold}</p>
                    </div>
                    <div className="text-right text-ink-700">
                      <p>{formatCurrency("KES", good.revenue)}</p>
                      {good.hasUnknownPricing && (
                        <p className="text-xs text-amber-700">Some line items had unknown pricing.</p>
                      )}
                    </div>
                  </div>
                ))}
                {salesLoaded && !salesError && soldGoods.length === 0 && (
                  <Alert tone="info">No paid sales have been recorded yet.</Alert>
                )}
              </div>
            )}
          </Card>

          {ordersLoaded && !ordersError && (
            <p className="text-sm text-ink-500">
              Showing {count} order{count === 1 ? "" : "s"}.
            </p>
          )}

          {ordersError && (
            <Alert tone="error">{ordersError}</Alert>
          )}

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.reference}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
                      {order.status}
                    </p>
                    <h3 className="text-lg font-semibold text-ink-900">{order.reference}</h3>
                  </div>
                  <div className="text-right text-sm text-ink-600">
                    <p>{formatCurrency(order.currency, order.amount)}</p>
                    <p>Paid at: {formatDateTime(order.paidAt)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 text-sm text-ink-700 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-ink-900">Customer</p>
                    <p className="mt-2">{order.customer.fullName}</p>
                    <p>{order.customer.email}</p>
                    <p>{order.customer.phone}</p>
                    <p className="mt-1">
                      {order.customer.address}, {order.customer.city}, {order.customer.county}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-ink-900">Delivery</p>
                    <p className="mt-2">{order.delivery.deliveryDate || "N/A"}</p>
                    <p>{order.delivery.deliveryWindow || "N/A"}</p>
                    <p className="mt-1">{order.delivery.deliveryNotes || "No delivery notes."}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-semibold text-ink-900">Products sold</p>
                  <div className="mt-3 space-y-2 text-sm text-ink-700">
                    {order.items.map((item) => (
                      <div
                        key={`${order.reference}-${item.id}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <p>
                          {item.name} <span className="text-ink-500">x{item.quantity}</span>
                        </p>
                        <p>
                          {typeof item.lineTotal === "number"
                            ? formatCurrency(order.currency, item.lineTotal)
                            : "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {ordersLoaded && !ordersLoading && !ordersError && orders.length === 0 && (
            <Alert tone="info">No orders found for this filter.</Alert>
          )}
            </>
          )}
        </div>
      </Section>
    </>
  );
};

export default AdminOrders;
