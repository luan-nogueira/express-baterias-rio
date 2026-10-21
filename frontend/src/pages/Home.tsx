import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUpRight, MapPin, Phone } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { WaButton } from "@/components/site/WaButton";
import { Reveal } from "@/components/site/Reveal";
import { BatteryFinder } from "@/components/finder/BatteryFinder";
import { QuoteForm } from "@/components/site/QuoteForm";
import { Reviews } from "@/components/site/Reviews";
import { Faq } from "@/components/site/Faq";
import { MAPS_URL, NEIGHBORHOODS, PHONE_DISPLAY, PHONE_TEL, WA_MESSAGES } from "@/lib/contact";

const FACTS = [
  { k: "Até 30 min", v: "para chegar até você" },
  { k: "Grátis", v: "entrega e instalação" },
  { k: "10x", v: "sem juros" },
  { k: "Achou mais barato?", v: "a gente cobre" },
];

const SERVICES = [
  {
    n: "01",
    title: "Socorro de bateria",
    body: "Carro não pega? Vamos até a rua, a garagem ou o estacionamento onde ele está, com a bateria certa para a troca.",
    msg: WA_MESSAGES.emergency,
    cta: "Pedir socorro",
  },
  {
    n: "02",
    title: "Baterias para carro",
    body: "Hatch, sedã, SUV e picape — incluindo modelos com Start-Stop, que pedem bateria EFB ou AGM.",
    msg: WA_MESSAGES.car,
    cta: "Orçamento para carro",
  },
  {
    n: "03",
    title: "Baterias para moto",
    body: "Baterias para motos e scooters do dia a dia, com instalação.",
    msg: WA_MESSAGES.moto,
    cta: "Orçamento para moto",
  },
  {
    n: "04",
    title: "Caminhões e utilitários",
    body: "Baterias de maior capacidade para caminhões, vans e utilitários de trabalho.",
    msg: WA_MESSAGES.truck,
    cta: "Orçamento para caminhão",
  },
];

function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] ${tone === "light" ? "text-amber-brand" : "text-navy-600"}`}>
      <span className={`h-px w-8 ${tone === "light" ? "bg-amber-brand" : "bg-navy-600"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

export default function Home() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <SiteLayout>
      <title>Express Baterias Rio – Socorro e troca de bateria automotiva no Rio</title>
      <meta
        name="description"
        content="Bateria arriou? Chegamos em até 30 minutos na Zona Sul, Centro e Barra da Tijuca. Entrega e instalação grátis, até 10x sem juros. Baterias para carro, moto e caminhão."
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white" aria-labelledby="hero-title">
        <div className="bg-wiring absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-28 pt-12 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-20">
          <div className="lg:col-span-7 lg:pr-6">
            <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-amber-brand animate-rise" data-testid="hero-eyebrow">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-wa opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-wa" />
              </span>
              Atendimento imediato · Zona Sul, Centro e Barra
            </p>
            <h1 id="hero-title" className="mt-6 text-[40px] font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-[68px]" data-testid="hero-title">
              Bateria arriou?
              <span className="block text-amber-brand">A gente leva a nova e instala onde o carro estiver.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300" data-testid="hero-subtitle">
              Troca de bateria automotiva no Rio de Janeiro. Chegamos em até 30 minutos, com entrega e instalação
              grátis e parcelamento em até 10x sem juros.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <WaButton message={WA_MESSAGES.emergency} testId="hero-whatsapp-button" size="lg">
                Chamar no WhatsApp agora
              </WaButton>
              <Link
                to="/encontre-sua-bateria"
                data-testid="hero-finder-button"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-md border border-white/25 px-6 font-semibold text-white transition-[border-color,color] duration-200 hover:border-amber-brand hover:text-amber-brand"
              >
                Encontrar a bateria do meu carro
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <a href={PHONE_TEL} data-testid="hero-call-link" className="mt-5 inline-flex items-center gap-2 font-mono text-sm text-slate-300 transition-colors hover:text-white">
              <Phone className="size-4" aria-hidden="true" /> ou ligue {PHONE_DISPLAY}
            </a>
          </div>

          <div className="relative lg:col-span-5">
            <div className="absolute -right-4 -top-4 hidden h-full w-full bg-amber-brand sm:block lg:-right-6 lg:-top-6" aria-hidden="true" />
            <img
              src="/img/3.webp"
              alt="Técnico da Express Baterias Rio atendendo um Ford com o capô aberto na rua, com o cartão da empresa em primeiro plano"
              width={1100}
              height={1545}
              fetchPriority="high"
              className="relative aspect-[4/5] w-full object-cover sm:aspect-[5/6] lg:aspect-[4/5]"
              data-testid="hero-image"
            />
            <div className="absolute -bottom-6 left-4 right-4 bg-white p-4 text-navy-900 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.5)] sm:left-auto sm:right-8 sm:w-64">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Foto real · atendimento na rua</p>
              <p className="mt-1 font-heading text-lg font-bold leading-tight">Troca feita no local, sem guincho.</p>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="relative h-px overflow-hidden" aria-hidden="true">
            <span className="absolute inset-y-0 left-0 w-1/4 animate-current bg-gradient-to-r from-transparent via-amber-brand to-transparent motion-reduce:hidden" />
          </div>
          <dl className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4" data-testid="hero-facts">
            {FACTS.map((f, i) => (
              <div key={f.k} className={`py-6 pr-4 ${i % 2 === 1 ? "pl-4 sm:pl-6" : ""} ${i > 0 ? "lg:border-l lg:border-white/10 lg:pl-6" : ""} ${i < 2 ? "border-b border-white/10 lg:border-b-0" : ""}`}>
                <dt className="font-heading text-xl font-bold text-white sm:text-2xl">{f.k}</dt>
                <dd className="mt-1 text-sm text-slate-400">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FINDER */}
      <section id="encontre" className="relative z-10 mx-auto -mt-0 max-w-7xl px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="finder-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Buscador de bateria</Eyebrow>
            <h2 id="finder-title" className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Encontre a bateria ideal para seu carro
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Informe o veículo e veja a bateria indicada com capacidade, corrente de partida, tecnologia e medidas.
              Depois é só pedir o orçamento — a equipe confirma tudo antes da venda.
            </p>
            <Link to="/encontre-sua-bateria" data-testid="finder-section-page-link" className="mt-6 inline-flex items-center gap-1.5 border-b-2 border-amber-brand pb-1 text-sm font-semibold text-navy-900 hover:text-navy-600">
              Abrir o buscador em tela cheia <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="border-t-4 border-amber-brand bg-white p-5 shadow-[0_30px_80px_-40px_rgb(10_20_56/0.45)] sm:p-8 lg:col-span-8">
            <BatteryFinder />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicos" className="border-t border-border bg-white" aria-labelledby="services-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Eyebrow>Produtos e serviços</Eyebrow>
              <h2 id="services-title" className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                Bateria para carro, moto e caminhão — e quem instala.
              </h2>
              <img
                src="/img/2.webp"
                alt="Fachada da loja Express Baterias Rio com o anúncio de delivery, entrega e instalação em domicílio, e baterias empilhadas na entrada"
                width={900}
                height={1200}
                loading="lazy"
                className="mt-8 aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
              />
            </div>
          </div>
          <ol className="lg:col-span-7 lg:pl-8">
            {SERVICES.map((s, i) => (
              <li key={s.n} className="border-t border-border py-8 first:border-t-0 first:pt-0 lg:first:pt-14" data-testid={`service-item-${i}`}>
                <Reveal>
                  <div className="grid gap-4 sm:grid-cols-[64px_1fr]">
                    <span className="font-mono text-sm text-amber-brand-hover">{s.n}</span>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-navy-900">{s.title}</h3>
                      <p className="mt-2 max-w-lg leading-relaxed text-slate-600">{s.body}</p>
                      <a
                        href={`https://wa.me/5521999404005?text=${encodeURIComponent(s.msg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`service-whatsapp-link-${i}`}
                        className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-navy-600"
                      >
                        {s.cta} pelo WhatsApp
                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* DIFFERENTIALS */}
      <section className="relative overflow-hidden bg-navy-900 text-white" aria-labelledby="why-title">
        <div className="bg-wiring absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow tone="light">Por que a Express</Eyebrow>
            <h2 id="why-title" className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
              Há 10 anos trocando bateria no Rio, do jeito que o cliente precisa: rápido e no lugar onde ele está.
            </h2>
            <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              <Reveal>
                <h3 className="font-heading text-xl font-semibold text-amber-brand">Chegamos rápido</h3>
                <p className="mt-2 leading-relaxed text-slate-300">Entrega e instalação em até 30 minutos, no local onde o veículo está.</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h3 className="font-heading text-xl font-semibold text-amber-brand">Garantia de verdade</h3>
                <p className="mt-2 leading-relaxed text-slate-300">Se algo não ficar certo, resolvemos — bateria e instalação com garantia.</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h3 className="font-heading text-xl font-semibold text-amber-brand">Preço coberto</h3>
                <p className="mt-2 leading-relaxed text-slate-300">Achou mais barato? Traga o orçamento e fechamos no seu preço.</p>
              </Reveal>
              <Reveal delay={0.15}>
                <h3 className="font-heading text-xl font-semibold text-amber-brand">Sem custo de visita</h3>
                <p className="mt-2 leading-relaxed text-slate-300">Entrega e instalação grátis, com parcelamento em até 10x sem juros.</p>
              </Reveal>
            </div>
            <div className="mt-12">
              <WaButton message={WA_MESSAGES.cheaper} testId="why-cheaper-whatsapp-button">Enviar meu orçamento</WaButton>
            </div>
          </div>
          <div className="lg:col-span-5">
            <figure className="relative">
              <img
                src="/img/4.webp"
                alt="Bateria trocada ao lado de um Jeep com o capô aberto e o certificado de garantia da Express Baterias Rio em primeiro plano"
                width={900}
                height={1200}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover"
              />
              <figcaption className="mt-3 font-mono text-xs text-slate-400">Atendimento real · certificado de garantia entregue na troca</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* SERVICE AREA + QUOTE */}
      <section id="atendimento" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="area-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Atendimento</Eyebrow>
            <h2 id="area-title" className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Nós vamos até você.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Atendemos a Zona Sul, o Centro e a Barra da Tijuca. Diga o bairro e o veículo: a equipe responde no WhatsApp com
              a bateria, o valor e a previsão de chegada.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px] text-navy-900 sm:grid-cols-3 lg:grid-cols-2" data-testid="area-neighborhoods">
              {NEIGHBORHOODS.map((n) => (
                <li key={n} className="flex items-center gap-2">
                  <span className="size-1.5 rotate-45 bg-amber-brand" aria-hidden="true" /> {n}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-500">Outro bairro? Consulte pelo WhatsApp.</p>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" data-testid="area-maps-link" className="mt-8 inline-flex items-center gap-2 font-semibold text-navy-800 hover:text-navy-600">
              <MapPin className="size-4" aria-hidden="true" /> Ver nossa referência no Google Maps
            </a>
            <img
              src="/img/1.webp"
              alt="Interior da loja Express Baterias Rio com estoque de baterias automotivas organizado"
              width={900}
              height={1200}
              loading="lazy"
              className="mt-10 hidden aspect-[4/3] w-full object-cover lg:block"
            />
          </div>
          <div id="orcamento" className="lg:col-span-7" aria-labelledby="quote-title">
            <h3 id="quote-title" className="text-2xl font-bold tracking-tight text-navy-900">Peça seu orçamento</h3>
            <p className="mb-6 mt-2 text-slate-600">Preenche rápido, a gente te chama primeiro.</p>
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="avaliacoes" className="border-y border-border bg-secondary/60" aria-labelledby="reviews-title">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Avaliações no Google</Eyebrow>
              <h2 id="reviews-title" className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                Quem já foi atendido conta como foi.
              </h2>
            </div>
            <p className="font-mono text-sm text-slate-600" data-testid="reviews-count">
              Classificação “Excelente” · <strong className="text-navy-900">453 avaliações</strong>
            </p>
          </div>
          <Reviews />
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="faq-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Dúvidas frequentes</Eyebrow>
            <h2 id="faq-title" className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Antes de chamar</h2>
            <p className="mt-4 text-slate-600">Não achou sua resposta? Pergunte direto para a equipe.</p>
            <div className="mt-6">
              <WaButton message={WA_MESSAGES.general} testId="faq-whatsapp-button" size="md">Tirar dúvida no WhatsApp</WaButton>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Faq />
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-amber-brand" aria-labelledby="cta-title">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between">
          <h2 id="cta-title" className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-navy-900">
            Carro parado agora? Mande a localização que a gente vai.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <WaButton
              message={WA_MESSAGES.emergency}
              testId="cta-whatsapp-button"
              size="lg"
              className="bg-navy-900 text-white shadow-none hover:bg-navy-700 hover:shadow-[0_10px_30px_-12px_rgb(10_20_56/0.6)] [&_svg]:text-wa"
            >
              Chamar no WhatsApp
            </WaButton>
            <a
              href={PHONE_TEL}
              data-testid="cta-call-button"
              className="inline-flex h-14 items-center justify-center gap-2.5 rounded-md border-2 border-navy-900 px-6 font-semibold text-navy-900 transition-[background-color,color] duration-200 hover:bg-navy-900 hover:text-white"
            >
              <Phone className="size-5" aria-hidden="true" />
              Ligar {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
