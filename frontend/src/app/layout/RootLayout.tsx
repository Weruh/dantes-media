import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "../../utils/scrollToTop";

const RootLayout = () => {
  const { pathname } = useLocation();
  const normalizedPath =
    pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const showContactFooter = normalizedPath === "/contact";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <ScrollToTop />
      <main className="flex-1">
        <Outlet />
      </main>
      {showContactFooter && <Footer />}
      <div className="border-t border-slate-100 bg-white py-4 text-center text-xs text-ink-400">
        (c) {new Date().getFullYear()} Dantes Media. All rights reserved.
      </div>
    </div>
  );
};

export default RootLayout;
