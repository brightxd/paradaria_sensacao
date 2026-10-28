import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="text-center py-16 px-4 max-w-3xl mx-auto">
        <div className="text-8xl mb-6">🍞</div>
        <h1 className="text-5xl font-black text-amber-700 leading-tight">
          Padaria <span className="text-amber-500">100sação</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-xl mx-auto">
          Pães fresquinhos, bolos caseiros e muito mais. Faça seu pedido e receba a confirmação no e-mail!
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/itens"
            className="px-8 py-4 rounded-2xl font-semibold text-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
          >
            Ver cardápio
          </Link>
          <Link
            href="/pedidos"
            className="px-8 py-4 rounded-2xl font-semibold text-lg bg-white text-amber-700 border border-amber-200 hover:bg-amber-50 transition-colors"
          >
            Acompanhar pedidos
          </Link>
        </div>
      </section>

      <section className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6 pb-16">
        {[
          { icon: "📷", title: "Fotos dos produtos", desc: "Cada produto com foto real, armazenada com segurança na nuvem." },
          { icon: "⚡", title: "Confirmação instantânea", desc: "Receba o e-mail de confirmação assim que seu pedido for processado." },
          { icon: "📱", title: "Acompanhe ao vivo", desc: "Veja o status do seu pedido mudar em tempo real, sem recarregar." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-sm transition-shadow">
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="font-bold text-gray-800 text-base">{title}</h3>
            <p className="text-gray-500 text-sm mt-1">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
