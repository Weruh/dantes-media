import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">Dantes Media</h3>
          <p className="mt-3 text-sm text-ink-500">
            Security-first ICT partner delivering reliable systems, product sales, and responsive support.
          </p>
          <p className="mt-4 text-xs text-ink-400">Secure networks. Reliable systems. Faster support.</p>
          <Link
            to="/admin"
            className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-ink-800 transition hover:border-slate-400 hover:text-ink-900"
          >
            Admin Dashboard
          </Link>
        </div>
        <div className="text-sm text-ink-500">
          <h4 className="font-semibold text-ink-900">Quick Links</h4>
          <ul className="mt-3 space-y-2">
            <li><Link to="/services" className="hover:text-ink-900">Services</Link></li>
            <li><Link to="/shop" className="hover:text-ink-900">Shop</Link></li>
            <li><Link to="/projects" className="hover:text-ink-900">Projects</Link></li>
            <li><Link to="/self-care" className="hover:text-ink-900">Self-Care</Link></li>
            <li><Link to="/contact" className="hover:text-ink-900">Contact</Link></li>
            <li><Link to="/admin" className="hover:text-ink-900">Admin</Link></li>
          </ul>
        </div>
        <div className="text-sm text-ink-500">
          <h4 className="font-semibold text-ink-900">Contact</h4>
          <ul className="mt-3 space-y-2">
            <li>Phone: +254(715) 578-015</li>
            <li>Email: info@dantesmediasolution.co.ke</li>
          </ul>
          <div className="mt-4">
            <h4 className="font-semibold text-ink-900">Social</h4>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-500">
              <span className="inline-flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-ink-400" aria-hidden="true" />
                LinkedIn
              </span>
              <span className="inline-flex items-center gap-2">
                <Instagram className="h-4 w-4 text-ink-400" aria-hidden="true" />
                Instagram
              </span>
              <span className="inline-flex items-center gap-2">
                <Facebook className="h-4 w-4 text-ink-400" aria-hidden="true" />
                Facebook
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-ink-400">
        (c) {new Date().getFullYear()} Dantes Media. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
