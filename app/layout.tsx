import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Padaria 100sação",
  description: "A padaria do bairro, agora online. Escolha seus favoritos e faça seu pedido!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 min-h-screen antialiased`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        <footer className="border-t border-gray-100 bg-white mt-16 py-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Padaria 100sação — Feito com ❤️ e muito pão
        </footer>
      </body>
    </html>
  );
}
