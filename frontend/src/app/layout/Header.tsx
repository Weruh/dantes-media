import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";
import { buttonClasses } from "../../components/Button";
import { cn } from "../../utils/cn";
import { useCart } from "../cart/CartContext";

const navItems = [
  { label: "Home", to: "/", end: true },
  { label: "Services", to: "/services" },
  { label: "Shop", to: "/shop" },
  { label: "Projects", to: "/projects" },
  { label: "Self-Care", to: "/self-care" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const LOGO_SRC = "/dantes%20logo2.0.png";

const Header = () => {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className={cn("sticky top-0 z-50 border-b border-slate-100 bg-white/95", open ? "" : "backdrop-blur")}>
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 sm:gap-3" aria-label="Dantes Media home">
          <img
            src={LOGO_SRC}
            alt="Dantes Media Solution logo"
            className="h-10 w-auto max-w-[140px] object-contain sm:h-12 sm:max-w-[180px]"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-700 sm:text-xs">
              Dantes Media Solution
            </span>
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.22em] text-brand-dark sm:text-[10px]">
              Elevating Visions
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-700 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "border-b-2 border-transparent pb-1 transition hover:text-ink-900",
                  isActive
                    ? "border-brand text-ink-900 font-semibold"
                    : "text-ink-500"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-ink-700 transition hover:border-slate-300"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-ink-900">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            to="/contact?tab=quote&serviceType=General%20Quote"
            className={buttonClasses("primary")}
          >
            Talk to Sales
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-ink-700 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 z-10 h-full w-[88%] max-w-sm bg-white shadow-2xl">
            <div className="flex h-full flex-col overflow-y-auto p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-ink-900">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full border border-slate-200 bg-white p-2"
                >
                  <X className="h-5 w-5 text-ink-700" />
                </button>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={LOGO_SRC}
                    alt="Dantes Media Solution logo"
                    className="h-12 w-auto max-w-[140px] object-contain"
                  />
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-700">
                      Dantes Media Solution
                    </span>
                    <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-brand-dark">
                      Elevating Visions
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/contact?tab=quote&serviceType=General%20Quote"
                className="mt-6 inline-flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink-900"
                onClick={() => setOpen(false)}
              >
                Talk to Sales
                <span aria-hidden="true">&rarr;</span>
              </Link>

              <Link
                to="/cart"
                className="mt-3 inline-flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink-900"
                onClick={() => setOpen(false)}
              >
                Cart
                <span aria-hidden="true">{itemCount}</span>
              </Link>

              <nav className="mt-6 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3" aria-label="Mobile">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "rounded-xl border px-3 py-2.5 text-base font-semibold transition",
                        isActive
                          ? "border-brand/60 bg-brand/20 text-ink-900"
                          : "border-slate-200 bg-white text-ink-900 hover:border-slate-300"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <Link
                to="/contact?tab=quote&serviceType=General%20Quote"
                className={cn(
                  "mt-auto inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-brand-dark"
                )}
                onClick={() => setOpen(false)}
              >
                Talk to Sales
              </Link>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};

export default Header;

