import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #78350f 0%, #92400e 40%, #b45309 75%, #d97706 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-amber-300/10" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/5" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 py-24 sm:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-amber-100 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            Fresquinho todo dia!
          </div>

          <h1 className="font-playfair text-5xl sm:text-7xl font-bold text-white leading-[1.05] max-w-3xl">
            A padaria do bairro,{" "}
            <span className="text-amber-300 italic">agora online</span>
          </h1>

          <p className="mt-6 text-amber-100/90 text-lg sm:text-xl max-w-xl leading-relaxed">
            Pães artesanais, bolos caseiros e delícias fresquinhas. Faça seu pedido e
            acompanhe em tempo real.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/itens"
              className="px-8 py-4 rounded-xl font-semibold text-base bg-white text-amber-900 hover:bg-amber-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Ver cardápio
            </Link>
            <Link
              href="/pedidos"
              className="px-8 py-4 rounded-xl font-semibold text-base border-2 border-white/40 text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Acompanhar pedidos
            </Link>
          </div>
        </div>
      </section>

      {/* Banner destaque */}
      <section className="bg-amber-50 border-y border-amber-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8 flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm font-medium text-amber-800">
          {[
            { icon: "🌾", text: "Ingredientes selecionados" },
            { icon: "🔥", text: "Forno a lenha artesanal" },
            { icon: "📦", text: "Entrega no mesmo dia" },
            { icon: "⭐", text: "Receitas da família" },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <span>{icon}</span>
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-amber-950">
            Mais do que pão — é uma experiência
          </h2>
          <p className="mt-3 text-stone-500 max-w-lg mx-auto">
            Do forno direto para você, com tecnologia pra facilitar cada detalhe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "📷",
              title: "Fotos reais dos produtos",
              desc: "Cada produto com foto tirada na padaria, guardada com segurança na nuvem.",
              bg: "bg-orange-50",
              ring: "ring-orange-100",
            },
            {
              icon: "⚡",
              title: "Confirmação instantânea",
              desc: "Receba e-mail de confirmação assim que seu pedido for processado pela cozinha.",
              bg: "bg-amber-50",
              ring: "ring-amber-100",
            },
            {
              icon: "📱",
              title: "Acompanhe ao vivo",
              desc: "Veja o status do seu pedido mudar em tempo real, sem precisar recarregar.",
              bg: "bg-yellow-50",
              ring: "ring-yellow-100",
            },
          ].map(({ icon, title, desc, bg, ring }) => (
            <div
              key={title}
              className={`${bg} ring-1 ${ring} rounded-2xl p-8 text-center hover:shadow-md transition-shadow`}
            >
              <div className="text-5xl mb-5">{icon}</div>
              <h3 className="font-playfair font-bold text-amber-950 text-lg mb-2">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-amber-900 py-14">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-playfair text-3xl font-bold text-white mb-4">
            Pronto para pedir?
          </h2>
          <p className="text-amber-200 mb-8">
            Veja nosso cardápio e monte o seu pedido em segundos.
          </p>
          <Link
            href="/itens"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base bg-amber-400 text-amber-950 hover:bg-amber-300 transition-all shadow-lg"
          >
            Ver cardápio agora →
          </Link>
        </div>
      </section>
    </>
  );
}
