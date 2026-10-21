import { useSearchParams } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BatteryFinder } from "@/components/finder/BatteryFinder";
import { FinderResult } from "@/components/finder/FinderResult";
import { WaButton } from "@/components/site/WaButton";
import { WA_MESSAGES } from "@/lib/contact";

export default function Finder() {
  const [params, setParams] = useSearchParams();
  const vehicleId = params.get("v");
  const yearRaw = Number(params.get("ano"));
  const year = Number.isInteger(yearRaw) && yearRaw > 1950 ? yearRaw : null;

  return (
    <SiteLayout>
      <title>Encontre a bateria ideal para seu carro | Express Baterias Rio</title>
      <meta
        name="description"
        content="Busque pelo modelo, ano e motor do seu carro e veja a bateria indicada: capacidade (Ah), CCA, tecnologia e medidas. Orçamento rápido pelo WhatsApp."
      />
      <link rel="canonical" href="https://expressbateriasrio.com.br/encontre-sua-bateria" />

      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl" data-testid="finder-page-title">
            Encontre a bateria ideal para seu carro
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Diga qual é o veículo e veja a bateria indicada. A equipe confirma compatibilidade, preço e disponibilidade antes da venda.
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 max-w-5xl px-5 pb-24 sm:px-8">
        {vehicleId ? (
          <FinderResult
            key={vehicleId}
            vehicleId={vehicleId}
            year={year}
            onChangeVehicle={() => {
              setParams({});
              window.scrollTo({ top: 0 });
            }}
          />
        ) : (
          <>
            <div className="border-t-4 border-amber-brand bg-white p-5 shadow-[0_30px_80px_-40px_rgb(10_20_56/0.45)] sm:p-8">
              <BatteryFinder />
            </div>
            <div className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-slate-600">
                <strong className="text-navy-900">Não achou seu veículo?</strong> O catálogo cresce toda semana. Mande modelo, ano e motor que
                a equipe indica a bateria certa.
              </p>
              <WaButton message={WA_MESSAGES.notFound} testId="finder-page-notfound-whatsapp-button">Falar com a equipe</WaButton>
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
