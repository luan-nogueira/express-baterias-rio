import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { apiGet, ApiError } from "@/lib/api";
import type { Battery, FinderResult as Result } from "@/lib/types";
import {
  differenceNote,
  dimensions,
  finderWhatsappMessage,
  formatBRL,
  POLARITY_LABEL,
  TECH_INFO,
  vehicleName,
  vehicleSpec,
  yearRange,
} from "@/lib/finder";
import { PHONE_DISPLAY, PHONE_TEL, WA_MESSAGES } from "@/lib/contact";
import { WaButton } from "@/components/site/WaButton";
import { BatteryGraphic } from "@/components/finder/BatteryGraphic";
import { cn } from "@/lib/utils";

interface Props {
  vehicleId: string;
  year: number | null;
  onChangeVehicle: () => void;
}

function Spec({ label, value, testId }: { label: string; value: React.ReactNode; testId: string }) {
  return (
    <div className="border-t border-border pt-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-mono text-[15px] font-semibold text-navy-900" data-testid={testId}>{value}</dd>
    </div>
  );
}

function BatteryCard({ battery, primary, index, data, year }: { battery: Battery; primary: Battery; index: number; data: Result; year: number | null }) {
  const isPrimary = index === 0;
  const dims = dimensions(battery);
  return (
    <article
      data-testid={`result-battery-card-${index}`}
      className={cn(
        "grid gap-6 rounded-md border bg-white p-5 sm:p-7 md:grid-cols-[200px_1fr]",
        isPrimary ? "border-navy-800 shadow-[0_24px_60px_-30px_rgb(10_20_56/0.45)]" : "border-border",
      )}
    >
      <div className="flex flex-col items-center justify-center rounded bg-slate-50 p-4">
        <BatteryGraphic battery={battery} className="w-full max-w-[200px]" />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-sm px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
              isPrimary ? "bg-amber-brand text-navy-900" : "bg-secondary text-navy-800",
            )}
          >
            {isPrimary ? "Indicação principal" : `Alternativa ${index}`}
          </span>
          <span className="font-mono text-xs text-slate-500">Código {battery.code}</span>
        </div>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-navy-900" data-testid={`result-battery-title-${index}`}>
          {battery.technology} {battery.ah}Ah
        </h3>
        <p className="text-sm text-slate-600">
          Marca e linha: <span className="font-medium text-slate-800">{battery.brand}{battery.line ? ` · ${battery.line}` : ""}</span>
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Spec label="Capacidade" value={`${battery.ah} Ah`} testId={`result-battery-ah-${index}`} />
          <Spec label="Partida (CCA)" value={battery.cca ? `${battery.cca} A` : "—"} testId={`result-battery-cca-${index}`} />
          <Spec label="Tecnologia" value={battery.technology} testId={`result-battery-tech-${index}`} />
          <Spec label="Polaridade" value={POLARITY_LABEL[battery.polarity]} testId={`result-battery-polarity-${index}`} />
          <Spec label="Dimensões (C×L×A)" value={dims ?? "—"} testId={`result-battery-dims-${index}`} />
          <Spec
            label="Preço"
            value={battery.price != null ? formatBRL(battery.price) : "Sob consulta"}
            testId={`result-battery-price-${index}`}
          />
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{TECH_INFO[battery.technology]}</p>
        {!isPrimary && (
          <p className="mt-2 border-l-2 border-amber-brand pl-3 text-sm text-slate-700" data-testid={`result-battery-diff-${index}`}>
            {differenceNote(primary, battery)}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          {battery.in_stock === true
            ? "Disponível em estoque (confirmamos no atendimento)."
            : battery.in_stock === false
              ? "Sem estoque no momento — consulte prazo."
              : "Disponibilidade confirmada pela equipe no atendimento."}
        </p>
        <div className="mt-5">
          <WaButton
            message={finderWhatsappMessage(data.vehicle, battery, year)}
            testId={`result-whatsapp-button-${index}`}
            size={isPrimary ? "lg" : "md"}
            className="w-full sm:w-auto"
          >
            Solicitar orçamento pelo WhatsApp
          </WaButton>
        </div>
      </div>
    </article>
  );
}

export function FinderResult({ vehicleId, year, onChangeVehicle }: Props) {
  const q = useQuery({
    queryKey: ["finder", "result", vehicleId],
    queryFn: () => apiGet<Result>(`/finder/result/${vehicleId}`),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 2,
  });

  const changeBtn = (
    <button
      type="button"
      onClick={onChangeVehicle}
      data-testid="result-change-vehicle-button"
      className="inline-flex h-11 items-center gap-2 rounded-md border border-navy-800 px-4 text-sm font-semibold text-navy-800 transition-colors duration-200 hover:bg-navy-800 hover:text-white"
    >
      <ArrowLeft className="size-4" aria-hidden="true" /> Alterar veículo
    </button>
  );

  if (q.isLoading) {
    return (
      <div className="space-y-4" data-testid="result-loading" aria-busy="true">
        <div className="h-28 animate-pulse rounded-md bg-white" />
        <div className="h-72 animate-pulse rounded-md bg-white" />
      </div>
    );
  }

  if (q.isError || !q.data) {
    const notFound = q.error instanceof ApiError && q.error.status === 404;
    return (
      <div className="rounded-md border border-border bg-white p-6 sm:p-8" data-testid="result-error">
        <h2 className="text-xl font-bold text-navy-900">
          {notFound ? "Esse veículo não está mais no catálogo" : "Não foi possível carregar o resultado"}
        </h2>
        <p className="mt-2 text-slate-600">Fale com a equipe: informamos a bateria correta pelo modelo, ano e motor.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <WaButton message={WA_MESSAGES.notFound} testId="result-error-whatsapp-button">Falar com a equipe</WaButton>
          {changeBtn}
        </div>
      </div>
    );
  }

  const { vehicle, batteries } = q.data;
  return (
    <div className="space-y-6" data-testid="finder-result">
      <section className="rounded-md bg-navy-900 p-6 text-white sm:p-8" aria-labelledby="result-vehicle-title">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-brand">Veículo selecionado</p>
            <h2 id="result-vehicle-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" data-testid="result-vehicle-name">
              {vehicleName(vehicle)}
            </h2>
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-slate-300">
              <div><dt className="sr-only">Motorização</dt><dd data-testid="result-vehicle-spec">{vehicleSpec(vehicle)}</dd></div>
              <div><dt className="inline text-slate-500">Ano </dt><dd className="inline" data-testid="result-vehicle-year">{year ?? yearRange(vehicle)}</dd></div>
              <div><dt className="inline text-slate-500">Start-Stop </dt><dd className="inline" data-testid="result-vehicle-startstop">{vehicle.start_stop ? "Sim" : "Não"}</dd></div>
            </dl>
          </div>
          <button
            type="button"
            onClick={onChangeVehicle}
            data-testid="result-change-vehicle-top-button"
            className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-md border border-white/25 px-4 text-sm font-semibold transition-colors duration-200 hover:border-amber-brand hover:text-amber-brand md:self-auto"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Alterar veículo
          </button>
        </div>
      </section>

      {vehicle.validated ? (
        <p className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" data-testid="result-validated-badge">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          Aplicação conferida pela equipe técnica da Express. Mesmo assim, confirmamos a bateria antes da instalação.
        </p>
      ) : (
        <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" data-testid="result-pending-validation-badge">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
          <p>
            <strong>Aguardando validação técnica.</strong> Esta indicação usa especificações de referência para o modelo e
            ainda não foi conferida pela nossa equipe. Ao pedir o orçamento, confirmamos ano, motor, polaridade e medidas antes da venda.
          </p>
        </div>
      )}

      {batteries.length === 0 ? (
        <div className="rounded-md border border-border bg-white p-6 sm:p-8" data-testid="result-no-battery">
          <h3 className="text-xl font-bold text-navy-900">Ainda não temos dados suficientes para indicar a bateria</h3>
          <p className="mt-2 max-w-2xl text-slate-600">
            Para não arriscar uma indicação errada, a equipe confirma a bateria correta para o seu {vehicleName(vehicle)} pelo WhatsApp.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <WaButton message={finderWhatsappMessage(vehicle, null, year)} testId="result-no-battery-whatsapp-button">
              Falar com um especialista
            </WaButton>
            {changeBtn}
          </div>
        </div>
      ) : (
        <>
          {batteries.length > 1 && (
            <p className="text-sm text-slate-600" data-testid="result-alternatives-note">
              Encontramos {batteries.length} opções para este veículo. A primeira é a indicação principal; as demais mostram o que muda.
            </p>
          )}
          {batteries.map((b, i) => (
            <BatteryCard key={b.id} battery={b} primary={batteries[0]} index={i} data={q.data} year={year} />
          ))}
        </>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>Preço, disponibilidade e compatibilidade são confirmados pela equipe antes da venda.</p>
        <a href={PHONE_TEL} data-testid="result-call-link" className="inline-flex items-center gap-2 font-semibold text-navy-800 hover:underline">
          <Phone className="size-4" aria-hidden="true" /> Prefere ligar? {PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}
