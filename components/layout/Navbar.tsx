"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/itens", label: "Cardápio" },
  { href: "/checkout", label: "Meu Pedido" },
  { href: "/pedidos", label: "Acompanhar" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-amber-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl">🍞</span>
          <div>
            <span className="font-bold text-amber-700 text-lg leading-none block">Padaria</span>
            <span className="font-black text-amber-600 text-sm leading-none">100sação</span>
          </div>
        </Link>

        <ul className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith(href)
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-600 hover:text-amber-700 hover:bg-amber-50"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/itens/novo"
              className="ml-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              + Produto
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
