import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Padaria 100sação",
  description: "A padaria do bairro, agora online. Escolha seus favoritos e faça seu pedido!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#fdf8f1] min-h-screen antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-amber-950 text-amber-100 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🍞</span>
                <div>
                  <p className="font-playfair font-bold text-white text-lg leading-none">Padaria</p>
                  <p className="font-playfair font-bold text-amber-400 text-xl leading-none">100sação</p>
                </div>
              </div>
              <p className="text-amber-300/80 text-sm leading-relaxed">
                Pães fresquinhos, bolos caseiros e muito amor em cada pedido.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-widest">Navegação</h4>
              <ul className="space-y-2 text-sm text-amber-300/80">
                <li><a href="/itens" className="hover:text-amber-300 transition-colors">Cardápio</a></li>
                <li><a href="/checkout" className="hover:text-amber-300 transition-colors">Meu Pedido</a></li>
                <li><a href="/pedidos" className="hover:text-amber-300 transition-colors">Acompanhar Pedidos</a></li>
                <li><a href="/itens/novo" className="hover:text-amber-300 transition-colors">Cadastrar Produto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-widest">Horário</h4>
              <div className="space-y-1 text-sm text-amber-300/80">
                <p>Seg – Sex: 06h às 19h</p>
                <p>Sábado: 06h às 14h</p>
                <p>Domingo: 07h às 12h</p>
              </div>
            </div>
          </div>
          <div className="border-t border-amber-900 py-4 text-center text-xs text-amber-400/60">
            © {new Date().getFullYear()} Padaria 100sação — Feito com ❤️ e muito pão
          </div>
        </footer>
      </body>
    </html>
  );
}
