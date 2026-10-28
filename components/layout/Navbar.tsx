"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/itens", label: "Cardápio" },
  { href: "/checkout", label: "Meu Pedido" },
  { href: "/pedidos", label: "Acompanhar" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-amber-100/60">
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3 group shrink-0" onClick={() => setOpen(false)}>
          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-xl shadow-sm group-hover:bg-amber-700 transition-colors">
            🍞
          </div>
          <div className="leading-none">
            <span className="font-playfair font-bold text-amber-900 text-base block">Padaria</span>
            <span className="font-playfair font-extrabold text-amber-600 text-lg block -mt-0.5">100sação</span>
          </div>
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith(href)
                    ? "bg-amber-50 text-amber-800 font-semibold"
                    : "text-stone-600 hover:text-amber-800 hover:bg-amber-50/70"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/admin"
              className="ml-3 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors border border-stone-200 hover:border-amber-200"
            >
              Admin ↗
            </Link>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-amber-50 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-amber-100 bg-white px-5 pb-4">
          <ul className="space-y-1 pt-3">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith(href)
                      ? "bg-amber-50 text-amber-800 font-semibold"
                      : "text-stone-600 hover:bg-amber-50"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-stone-400 hover:bg-amber-50 transition-colors">
                Admin ↗
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
