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
import { LocationButton } from "@/components/site/LocationButton";
import { StoreDetails } from "@/components/site/StoreDetails";
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
        content="Bateria arriou? Chegamos em até 30 minutos na Zona Sul e no Centro. Entrega e instalação grátis, até 10x sem juros. Baterias para carro, moto e caminhão."
      />
      <link rel="canonical" href="https://expressbateriasrio.com.br/" />

      {/* HERO */}
      <section className="hero-shop bg-navy-900 text-white" aria-labelledby="hero-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-20 lg:pt-16">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-2.5 text-sm font-semibold text-slate-300" data-testid="hero-eyebrow">
              <span className="size-2 rounded-full bg-wa" aria-hidden="true" />
              Atendimento imediato na Zona Sul e no Centro
            </p>
            <h1 id="hero-title" className="mt-5 text-[38px] font-extrabold leading-[1.04] text-white sm:text-[54px] lg:text-[60px]" data-testid="hero-title">
              Bateria arriou? A gente instala a nova <span className="text-amber-brand">onde o carro estiver.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300" data-testid="hero-subtitle">
              Chegamos em até 30 minutos, com <strong className="font-semibold text-white">entrega e instalação grátis</strong> e
              parcelamento em <strong className="font-semibold text-white">até 10x sem juros</strong>.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <WaButton message={WA_MESSAGES.emergency} testId="hero-whatsapp-button" size="lg">
                Chamar no WhatsApp agora
              </WaButton>
              <Link
                to="/encontre-sua-bateria"
                data-testid="hero-finder-button"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-md border-2 border-white px-6 font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-navy-900"
              >
                Encontrar a bateria do meu carro
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <LocationButton variant="link" testId="hero-location-button" className="text-white hover:text-amber-brand" />
              <a href={PHONE_TEL} data-testid="hero-call-link" className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-amber-brand">
                <Phone className="size-4" aria-hidden="true" /> ou ligue {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <figure className="relative lg:col-span-5">
            <img
              src="/img/3.webp"
              alt="Técnico da Express Baterias Rio atendendo um Ford com o capô aberto na rua, com o cartão da empresa em primeiro plano"
              width={1100}
              height={1545}
              fetchPriority="high"
              className="aspect-[4/5] w-full rounded-sm object-cover sm:aspect-[5/6] lg:aspect-[4/5]"
              data-testid="hero-image"
            />
            <figcaption className="absolute -left-2 bottom-6 bg-amber-brand px-4 py-3 text-navy-900 shadow-[5px_5px_0_#0A1438] sm:-left-4">
              <span className="block font-heading text-base font-bold leading-tight">Troca feita no local, sem guincho</span>
              <span className="block text-xs font-medium">Foto real de atendimento</span>
            </figcaption>
          </figure>
        </div>

        <div className="border-y border-white/10 bg-navy-800">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4" data-testid="hero-facts">
            {FACTS.map((f, i) => (
              <div key={f.k} className={`py-6 pr-4 ${i % 2 === 1 ? "pl-4 sm:pl-6" : ""} ${i > 0 ? "lg:border-l lg:border-white/10 lg:pl-6" : ""} ${i < 2 ? "border-b border-white/10 lg:border-b-0" : ""}`}>
                <dt className="font-heading text-xl font-bold text-amber-brand sm:text-2xl">{f.k}</dt>
                <dd className="mt-1 text-sm text-slate-300">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FINDER */}
      <section id="encontre" className="band-gray relative z-10 mx-auto -mt-0 max-w-7xl px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="finder-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="finder-title" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
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
      <section id="servicos" className="bg-white" aria-labelledby="services-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <h2 id="services-title" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
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
                  <div>
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
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="why-title" className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
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
      <section id="atendimento" className="band-gray mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="area-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="area-title" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Nós vamos até você.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Atendemos a Zona Sul, o Centro e os bairros próximos. Diga o bairro e o veículo: a equipe responde no WhatsApp com
              a bateria, o valor e a previsão de chegada.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px] text-navy-900 sm:grid-cols-3 lg:grid-cols-2" data-testid="area-neighborhoods">
              {NEIGHBORHOODS.map((n) => (
                <li key={n} className="flex items-center gap-2">
                  {n}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-600">Outro bairro? Consulte pelo WhatsApp.</p>
            <StoreDetails className="mt-8" />
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
      <section id="avaliacoes" className="bg-white" aria-labelledby="reviews-title">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="reviews-title" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                Quem já foi atendido conta como foi.
              </h2>
            </div>
            <p className="text-sm text-slate-600" data-testid="reviews-count">
              Classificação “Excelente” · <strong className="text-navy-900">453 avaliações</strong>
            </p>
          </div>
          <Reviews />
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" className="band-gray mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="faq-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="faq-title" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Antes de chamar</h2>
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
            <LocationButton testId="cta-location-button" />
            <WaButton
              message={WA_MESSAGES.emergency}
              testId="cta-whatsapp-button"
              size="lg"
              className="border-2 border-navy-900 bg-transparent text-navy-900 shadow-none hover:bg-navy-900 hover:text-white hover:shadow-none"
            >
              Chamar no WhatsApp
            </WaButton>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
