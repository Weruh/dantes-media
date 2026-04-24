import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Section from "../components/Section";
import Card from "../components/Card";
import Alert from "../components/Alert";
import { Input, SelectField, Textarea } from "../components/Input";
import { Button } from "../components/Button";
import { defaultProductCategories } from "../data/catalogTypes";
import { resetCatalogCache } from "../data/productsApi";
import {
  addCustomProduct,
  buildSoldGoods,
  getCurrentAdminUser,
  loadCustomProducts,
  loadOrders,
  loadPaidOrders,
  loadQuoteRequests,
  signInAdmin,
  signOutAdmin,
  type CustomProduct,
  type OrderRecord,
  type QuoteRequest,
  type SoldGood,
} from "../lib/backend";

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

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const AdminOrders = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [status, setStatus] = useState("paid");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [count, setCount] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [soldGoods, setSoldGoods] = useState<SoldGood[]>([]);
  const [paidOrdersCount, setPaidOrdersCount] = useState(0);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesLoaded, setSalesLoaded] = useState(false);
  const [salesError, setSalesError] = useState("");
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [quotesCount, setQuotesCount] = useState(0);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesLoaded, setQuotesLoaded] = useState(false);
  const [quotesError, setQuotesError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState("");
  const [productSuccess, setProductSuccess] = useState("");

  const isAuthenticated = loggedInEmail.trim().length > 0;

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const user = await getCurrentAdminUser();
        if (cancelled) return;

        if (user?.email) {
          setLoggedInEmail(user.email);
        }
      } catch (error) {
        if (!cancelled) {
          setAuthError(error instanceof Error ? error.message : "Unable to load admin session.");
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearAuth = () => {
    setLoggedInEmail("");
    setAdminPassword("");
    setOrders([]);
    setCount(0);
    setSoldGoods([]);
    setPaidOrdersCount(0);
    setCustomProducts([]);
    setQuotes([]);
  };

  const loadOrdersState = async (statusFilter = status) => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const nextOrders = await loadOrders(statusFilter);
      setOrders(nextOrders);
      setCount(nextOrders.length);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Unable to fetch orders.");
    } finally {
      setOrdersLoading(false);
      setOrdersLoaded(true);
    }
  };

  const loadCatalogState = async () => {
    setCatalogLoading(true);
    setCatalogError("");

    try {
      const products = await loadCustomProducts();
      setCustomProducts(products);
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Unable to fetch products.");
    } finally {
      setCatalogLoading(false);
      setCatalogLoaded(true);
    }
  };

  const loadSalesState = async () => {
    setSalesLoading(true);
    setSalesError("");

    try {
      const paidOrders = await loadPaidOrders();
      setPaidOrdersCount(paidOrders.length);
      setSoldGoods(buildSoldGoods(paidOrders));
    } catch (error) {
      setSalesError(error instanceof Error ? error.message : "Unable to fetch sold goods.");
    } finally {
      setSalesLoading(false);
      setSalesLoaded(true);
    }
  };

  const loadQuotesState = async () => {
    setQuotesLoading(true);
    setQuotesError("");

    try {
      const requests = await loadQuoteRequests();
      setQuotes(requests);
      setQuotesCount(requests.length);
    } catch (error) {
      setQuotesError(
        error instanceof Error ? error.message : "Unable to fetch quote requests."
      );
    } finally {
      setQuotesLoading(false);
      setQuotesLoaded(true);
    }
  };

  const loadDashboard = async (statusFilter = status) => {
    setAuthError("");
    await Promise.all([
      loadOrdersState(statusFilter),
      loadCatalogState(),
      loadSalesState(),
      loadQuotesState(),
    ]);
  };

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isAuthenticated]);

  const handleLogin = async () => {
    if (!adminEmail.trim() || !adminPassword) {
      setAuthError("Enter admin email and password.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const { user } = await signInAdmin(adminEmail.trim(), adminPassword);
      setLoggedInEmail(user?.email || adminEmail.trim());
      setAdminPassword("");
      await loadDashboard();
    } catch (error) {
      clearAuth();
      setAuthError(error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
    } catch {
      // Clear local UI state even if remote sign-out fails.
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
    if (!isAuthenticated) {
      setAuthError("Login with your Supabase admin account.");
      return;
    }

    setProductSaving(true);
    setProductError("");
    setProductSuccess("");

    try {
      const productId = toSlug(productForm.id || productForm.name);
      if (!productId) {
        throw new Error("Product name or id is required.");
      }

      await addCustomProduct({
        id: productId,
        name: productForm.name.trim(),
        category: productForm.category,
        shortDesc: productForm.shortDesc.trim(),
        price: Number(productForm.price),
        image: productForm.image.trim() || "/assets/consultacy.jpg",
        featured: productForm.featured,
        specs: productForm.specs
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      });

      setProductSuccess("Product added successfully.");
      setProductForm(defaultProductForm());
      resetCatalogCache();
      await Promise.all([loadCatalogState(), loadSalesState()]);
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Unable to add product.");
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
        subtitle="Add new products, review sold goods, inspect order records, and view quote requests."
      >
        <div className="space-y-6">
          <Card>
            {isAuthenticated ? (
              <div className="space-y-4">
                <Alert tone="success">Logged in as {loggedInEmail}.</Alert>
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
                    onClick={() => loadDashboard(status)}
                    disabled={
                      ordersLoading || salesLoading || catalogLoading || quotesLoading
                    }
                  >
                    {ordersLoading || salesLoading || catalogLoading || quotesLoading
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
                  label="Supabase admin email"
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

          {isAuthenticated && (
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
                            <p className="text-xs text-amber-700">
                              Some line items had unknown pricing.
                            </p>
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

              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
                      Leads
                    </p>
                    <h3 className="text-lg font-semibold text-ink-900">Quote Requests</h3>
                  </div>
                  {quotesLoaded && !quotesError && (
                    <p className="text-sm text-ink-500">Requests stored: {quotesCount}</p>
                  )}
                </div>

                {quotesError && (
                  <Alert tone="error" className="mt-4">
                    {quotesError}
                  </Alert>
                )}

                {quotesLoading ? (
                  <p className="mt-4 text-sm text-ink-500">Loading quote requests...</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {quotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-ink-700"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink-900">{quote.fullName}</p>
                            <p>{quote.email}</p>
                            <p>{quote.phone}</p>
                            <p className="mt-1 text-xs text-ink-500">
                              {quote.company ? `${quote.company} · ` : ""}
                              {quote.location} · {quote.serviceType}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
                              {quote.notificationStatus}
                            </p>
                            <p className="mt-1 text-xs text-ink-500">
                              {formatDateTime(quote.createdAt)}
                            </p>
                          </div>
                        </div>

                        {quote.budgetRange && (
                          <p className="mt-3 text-xs text-ink-500">Budget: {quote.budgetRange}</p>
                        )}

                        <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          {quote.message}
                        </p>

                        {quote.notificationError && (
                          <p className="mt-3 text-xs text-amber-700">
                            Email issue: {quote.notificationError}
                          </p>
                        )}
                      </div>
                    ))}

                    {quotesLoaded && !quotesError && quotes.length === 0 && (
                      <Alert tone="info">No quote requests have been submitted yet.</Alert>
                    )}
                  </div>
                )}
              </Card>

              {ordersLoaded && !ordersError && (
                <p className="text-sm text-ink-500">
                  Showing {count} order{count === 1 ? "" : "s"}.
                </p>
              )}

              {ordersError && <Alert tone="error">{ordersError}</Alert>}

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
                        <p className="mt-1">
                          {order.delivery.deliveryNotes || "No delivery notes."}
                        </p>
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
