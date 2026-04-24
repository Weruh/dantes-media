import { useEffect, useState, type ChangeEvent } from "react";
import { Helmet } from "react-helmet-async";
import {
  Boxes,
  CheckCircle2,
  ImagePlus,
  Loader2,
  LogOut,
  PackagePlus,
  RefreshCw,
  ReceiptText,
  ShoppingBag,
  Upload,
} from "lucide-react";
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
  uploadCustomProductImage,
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

type StatTileProps = {
  label: string;
  value: string;
  detail: string;
  icon: typeof Boxes;
};

type PanelHeaderProps = {
  eyebrow: string;
  title: string;
  meta?: string;
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

const StatTile = ({ label, value, detail, icon: Icon }: StatTileProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-ink-400">{label}</p>
        <p className="mt-2 truncate text-2xl font-semibold text-ink-900">{value}</p>
      </div>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-ink-900">
        <Icon size={20} />
      </span>
    </div>
    <p className="mt-3 text-xs text-ink-500">{detail}</p>
  </div>
);

const PanelHeader = ({ eyebrow, title, meta }: PanelHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <p className="text-xs font-semibold uppercase text-ink-400">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-semibold text-ink-900">{title}</h3>
    </div>
    {meta && (
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-ink-600">
        {meta}
      </span>
    )}
  </div>
);

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
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState("");

  const isAuthenticated = loggedInEmail.trim().length > 0;
  const dashboardLoading = ordersLoading || salesLoading || catalogLoading || quotesLoading;
  const totalRevenue = soldGoods.reduce((sum, good) => sum + good.revenue, 0);
  const productIdPreview = toSlug(productForm.id || productForm.name);

  useEffect(() => {
    if (!productImageFile) {
      setProductImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(productImageFile);
    setProductImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [productImageFile]);

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
      setQuotesError(error instanceof Error ? error.message : "Unable to fetch quote requests.");
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

  const handleProductImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setProductError("");
    setProductImageFile(file);
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

      const uploadedImage = productImageFile
        ? await uploadCustomProductImage(productImageFile, productId)
        : "";

      await addCustomProduct({
        id: productId,
        name: productForm.name.trim(),
        category: productForm.category,
        shortDesc: productForm.shortDesc.trim(),
        price: Number(productForm.price),
        image: uploadedImage || productForm.image.trim() || "/assets/consultacy.jpg",
        featured: productForm.featured,
        specs: productForm.specs
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      });

      setProductSuccess("Product added successfully.");
      setProductForm(defaultProductForm());
      setProductImageFile(null);
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
        subtitle="Add products, monitor sales, review order records, and respond to quote requests."
      >
        <div className="space-y-6">
          <Card className="rounded-xl bg-white p-5">
            {isAuthenticated ? (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-ink-400">Signed in</p>
                  <p className="mt-1 truncate text-sm font-semibold text-ink-900">
                    {loggedInEmail}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(180px,240px)_auto_auto] sm:items-end">
                  <SelectField
                    label="Order status"
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
                    disabled={dashboardLoading}
                    className="h-[46px]"
                  >
                    {dashboardLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                    {dashboardLoading ? "Loading" : "Refresh"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleLogout}
                    className="h-[46px]"
                  >
                    <LogOut size={18} />
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
                <Button
                  type="button"
                  onClick={handleLogin}
                  disabled={authLoading}
                  className="h-[46px]"
                >
                  {authLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {authLoading ? "Signing in" : "Login"}
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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatTile
                  label="Orders"
                  value={String(count)}
                  detail={`Current filter: ${status}`}
                  icon={ReceiptText}
                />
                <StatTile
                  label="Revenue"
                  value={formatCurrency("KES", totalRevenue)}
                  detail={`${paidOrdersCount} paid orders tracked`}
                  icon={ShoppingBag}
                />
                <StatTile
                  label="Products"
                  value={String(customProducts.length)}
                  detail="Custom products in catalog"
                  icon={Boxes}
                />
                <StatTile
                  label="Quotes"
                  value={String(quotesCount)}
                  detail="Stored quote requests"
                  icon={PackagePlus}
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
                <Card className="rounded-xl bg-white p-5">
                  <PanelHeader
                    eyebrow="Product Catalog"
                    title="Add Product"
                    meta={productIdPreview || "New item"}
                  />

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <Input
                      label="Product name"
                      value={productForm.name}
                      onChange={(event) => setProductField("name", event.target.value)}
                      placeholder="Automatic Boom Barrier"
                    />
                    <Input
                      label="Product id"
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
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="space-y-4">
                      <Input
                        label="Image URL or asset path"
                        value={productForm.image}
                        onChange={(event) => setProductField("image", event.target.value)}
                        placeholder="/assets/new-product.png"
                      />
                      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-700">
                        <input
                          type="checkbox"
                          checked={productForm.featured}
                          onChange={(event) => setProductField("featured", event.target.checked)}
                        />
                        Mark as featured product
                      </label>
                    </div>
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                        <ImagePlus size={18} />
                        Device upload
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageFileChange}
                        className="mt-3 block w-full text-sm text-ink-700 file:mr-3 file:rounded-full file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-900"
                      />
                      {productImagePreview ? (
                        <img
                          src={productImagePreview}
                          alt="Selected product preview"
                          className="mt-4 h-32 w-full rounded-xl border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="mt-4 flex h-32 items-center justify-center rounded-xl border border-slate-200 bg-white text-ink-400">
                          <Upload size={24} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <Textarea
                      label="Short description"
                      value={productForm.shortDesc}
                      onChange={(event) => setProductField("shortDesc", event.target.value)}
                      placeholder="Access control barrier for secure parking areas."
                      className="min-h-[96px]"
                    />
                    <Textarea
                      label="Specs (one per line)"
                      value={productForm.specs}
                      onChange={(event) => setProductField("specs", event.target.value)}
                      placeholder={"24V motor\nRemote controls\nSafety sensors"}
                      className="min-h-[132px]"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button type="button" onClick={handleAddProduct} disabled={productSaving}>
                      {productSaving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <PackagePlus size={18} />
                      )}
                      {productSaving ? "Saving" : "Add product"}
                    </Button>
                    {productSuccess && <Alert tone="success">{productSuccess}</Alert>}
                  </div>

                  {productError && (
                    <Alert tone="error" className="mt-4">
                      {productError}
                    </Alert>
                  )}
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-xl bg-white p-5">
                    <PanelHeader
                      eyebrow="Catalog"
                      title="Custom Products"
                      meta={`${customProducts.length} total`}
                    />
                    {catalogError && (
                      <Alert tone="error" className="mt-4">
                        {catalogError}
                      </Alert>
                    )}
                    <div className="mt-4 max-h-[360px] space-y-2 overflow-auto pr-1">
                      {catalogLoading && <p className="text-sm text-ink-500">Loading products...</p>}
                      {catalogLoaded &&
                        !catalogLoading &&
                        !catalogError &&
                        customProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink-900">{product.name}</p>
                              <p className="truncate text-xs text-ink-400">{product.id}</p>
                            </div>
                            <p className="shrink-0 font-semibold text-ink-700">
                              {formatCurrency("KES", product.price)}
                            </p>
                          </div>
                        ))}
                      {catalogLoaded && !catalogError && customProducts.length === 0 && (
                        <Alert tone="info">No custom products yet.</Alert>
                      )}
                    </div>
                  </Card>

                  <Card className="rounded-xl bg-white p-5">
                    <PanelHeader
                      eyebrow="Sales"
                      title="Sold Goods"
                      meta={`${paidOrdersCount} paid orders`}
                    />
                    {salesError && (
                      <Alert tone="error" className="mt-4">
                        {salesError}
                      </Alert>
                    )}
                    <div className="mt-4 max-h-[360px] space-y-2 overflow-auto pr-1">
                      {salesLoading ? (
                        <p className="text-sm text-ink-500">Loading sold goods...</p>
                      ) : (
                        soldGoods.map((good) => (
                          <div
                            key={good.id}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-ink-900">{good.name}</p>
                                <p className="text-xs text-ink-500">Qty sold: {good.quantitySold}</p>
                              </div>
                              <p className="shrink-0 font-semibold text-ink-700">
                                {formatCurrency("KES", good.revenue)}
                              </p>
                            </div>
                            {good.hasUnknownPricing && (
                              <p className="mt-2 text-xs text-amber-700">
                                Some line items had unknown pricing.
                              </p>
                            )}
                          </div>
                        ))
                      )}
                      {salesLoaded && !salesError && soldGoods.length === 0 && (
                        <Alert tone="info">No paid sales have been recorded yet.</Alert>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.75fr)_minmax(0,1.25fr)]">
                <Card className="rounded-xl bg-white p-5">
                  <PanelHeader eyebrow="Leads" title="Quote Requests" meta={`${quotesCount} stored`} />
                  {quotesError && (
                    <Alert tone="error" className="mt-4">
                      {quotesError}
                    </Alert>
                  )}
                  <div className="mt-4 max-h-[560px] space-y-3 overflow-auto pr-1">
                    {quotesLoading ? (
                      <p className="text-sm text-ink-500">Loading quote requests...</p>
                    ) : (
                      quotes.map((quote) => (
                        <div key={quote.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink-900">{quote.fullName}</p>
                              <p className="truncate text-ink-600">{quote.email}</p>
                              <p className="text-ink-600">{quote.phone}</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-ink-500">
                              {quote.notificationStatus}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-ink-500">
                            {quote.company ? `${quote.company} - ` : ""}
                            {quote.location} - {quote.serviceType}
                          </p>
                          <p className="mt-3 max-h-24 overflow-hidden rounded-xl bg-slate-50 p-3 text-ink-700">
                            {quote.message}
                          </p>
                          <p className="mt-2 text-xs text-ink-400">{formatDateTime(quote.createdAt)}</p>
                        </div>
                      ))
                    )}
                    {quotesLoaded && !quotesError && quotes.length === 0 && (
                      <Alert tone="info">No quote requests have been submitted yet.</Alert>
                    )}
                  </div>
                </Card>

                <Card className="rounded-xl bg-white p-5">
                  <PanelHeader
                    eyebrow="Orders"
                    title="Order Records"
                    meta={ordersLoaded && !ordersError ? `${count} shown` : undefined}
                  />
                  {ordersError && (
                    <Alert tone="error" className="mt-4">
                      {ordersError}
                    </Alert>
                  )}
                  <div className="mt-4 space-y-4">
                    {orders.map((order) => (
                      <div key={order.reference} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold uppercase text-ink-700">
                              {order.status}
                            </span>
                            <h4 className="mt-2 text-base font-semibold text-ink-900">{order.reference}</h4>
                            <p className="mt-1 text-sm text-ink-500">{order.customer.fullName}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-semibold text-ink-900">
                              {formatCurrency(order.currency, order.amount)}
                            </p>
                            <p className="text-ink-500">Paid: {formatDateTime(order.paidAt)}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm text-ink-700 md:grid-cols-2">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="font-semibold text-ink-900">Customer</p>
                            <p className="mt-1">{order.customer.email}</p>
                            <p>{order.customer.phone}</p>
                            <p className="mt-1 text-ink-500">
                              {order.customer.address}, {order.customer.city}, {order.customer.county}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="font-semibold text-ink-900">Delivery</p>
                            <p className="mt-1">{order.delivery.deliveryDate || "N/A"}</p>
                            <p>{order.delivery.deliveryWindow || "N/A"}</p>
                            <p className="mt-1 text-ink-500">
                              {order.delivery.deliveryNotes || "No delivery notes."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
                          {order.items.map((item) => (
                            <div
                              key={`${order.reference}-${item.id}`}
                              className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-ink-700"
                            >
                              <p className="min-w-0 truncate">
                                {item.name} <span className="text-ink-500">x{item.quantity}</span>
                              </p>
                              <p className="shrink-0 font-semibold text-ink-900">
                                {typeof item.lineTotal === "number"
                                  ? formatCurrency(order.currency, item.lineTotal)
                                  : "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {ordersLoaded && !ordersLoading && !ordersError && orders.length === 0 && (
                      <Alert tone="info">No orders found for this filter.</Alert>
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  );
};

export default AdminOrders;
