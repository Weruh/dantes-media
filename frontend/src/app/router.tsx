import type { ReactNode } from "react";
import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layout/RootLayout";

const Home = lazy(() => import("../pages/Home"));
const Services = lazy(() => import("../pages/Services"));
const ServiceDetail = lazy(() => import("../pages/ServiceDetail"));
const Shop = lazy(() => import("../pages/Shop"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const CheckoutVerify = lazy(() => import("../pages/CheckoutVerify"));
const AdminDashboard = lazy(() => import("../pages/AdminOrders"));
const Projects = lazy(() => import("../pages/Projects"));
const ProjectDetail = lazy(() => import("../pages/ProjectDetail"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const SelfCare = lazy(() => import("../pages/SelfCare"));
const PostDetail = lazy(() => import("../pages/PostDetail"));
const PillarDetail = lazy(() => import("../pages/PillarDetail"));

const PageLoader = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="px-6 py-16 text-ink-500">Loading...</div>}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <PageLoader><Home /></PageLoader> },
      { path: "services", element: <PageLoader><Services /></PageLoader> },
      { path: "services/:slug", element: <PageLoader><ServiceDetail /></PageLoader> },
      { path: "shop", element: <PageLoader><Shop /></PageLoader> },
      { path: "shop/:id", element: <PageLoader><ProductDetail /></PageLoader> },
      { path: "cart", element: <PageLoader><Cart /></PageLoader> },
      { path: "checkout", element: <PageLoader><Checkout /></PageLoader> },
      { path: "checkout/verify", element: <PageLoader><CheckoutVerify /></PageLoader> },
      { path: "admin", element: <PageLoader><AdminDashboard /></PageLoader> },
      { path: "admin/orders", element: <PageLoader><AdminDashboard /></PageLoader> },
      { path: "projects", element: <PageLoader><Projects /></PageLoader> },
      { path: "projects/:slug", element: <PageLoader><ProjectDetail /></PageLoader> },
      { path: "about", element: <PageLoader><About /></PageLoader> },
      { path: "pillars/:slug", element: <PageLoader><PillarDetail /></PageLoader> },
      { path: "self-care", element: <PageLoader><SelfCare /></PageLoader> },
      { path: "self-care/:slug", element: <PageLoader><PostDetail /></PageLoader> },
      { path: "contact", element: <PageLoader><Contact /></PageLoader> },
    ],
  },
]);
