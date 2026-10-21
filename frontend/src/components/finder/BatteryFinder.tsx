import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Vehicle } from "@/lib/types";
import { vehicleName, vehicleSpec, yearRange } from "@/lib/finder";
import { WA_MESSAGES } from "@/lib/contact";
import { WaButton } from "@/components/site/WaButton";
import { cn } from "@/lib/utils";

type Mode = "search" | "cascade";

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const selectCls =
  "h-12 w-full appearance-none rounded-md border border-input bg-white bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230C1A4B' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-[length:12px] bg-[right_14px_center] bg-no-repeat pl-3.5 pr-9 text-[15px] text-foreground transition-[border-color,box-shadow] duration-200 hover:border-navy-600 focus-visible:border-amber-brand focus-visible:ring-2 focus-visible:ring-amber-brand/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export function BatteryFinder() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("search");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const debounced = useDebounced(q.trim(), 200);
  const listId = useId();
  const cascadeRef = useRef<HTMLDivElement>(null);

  const go = (v: Vehicle, y?: number | null) =>
    navigate(`/encontre-sua-bateria?v=${v.id}${y ? `&ano=${y}` : ""}`);

  const searchQ = useQuery({
    queryKey: ["finder", "search", debounced],
    queryFn: () => apiGet<Vehicle[]>(`/finder/search?q=${encodeURIComponent(debounced)}`),
    enabled: debounced.length >= 2,
  });
  const makesQ = useQuery({ queryKey: ["finder", "makes"], queryFn: () => apiGet<string[]>("/finder/makes") });
  const modelsQ = useQuery({
    queryKey: ["finder", "models", make],
    queryFn: () => apiGet<string[]>(`/finder/models?make=${encodeURIComponent(make)}`),
    enabled: !!make,
  });
  const yearsQ = useQuery({
    queryKey: ["finder", "years", make, model],
    queryFn: () => apiGet<number[]>(`/finder/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`),
    enabled: !!make && !!model,
  });
  const versionsQ = useQuery({
    queryKey: ["finder", "versions", make, model, year],
    queryFn: () =>
      apiGet<Vehicle[]>(
        `/finder/versions?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`,
      ),
    enabled: !!make && !!model && !!year,
  });
  const popularQ = useQuery({ queryKey: ["finder", "popular"], queryFn: () => apiGet<Vehicle[]>("/finder/popular") });

  const results = debounced.length >= 2 && !searchQ.isError ? (searchQ.data ?? []) : [];
  const typedYear = (() => {
    const m = q.match(/\b(19|20)\d{2}\b/);
    return m ? Number(m[0]) : null;
  })();

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(results[active], typedYear);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const pickPopular = (v: Vehicle) => {
    setMode("cascade");
    setMake(v.make);
    setModel(v.model);
    setYear("");
    requestAnimationFrame(() => cascadeRef.current?.querySelector<HTMLSelectElement>("#finder-year")?.focus());
  };

  const catalogDown = makesQ.isError;

  return (
    <div data-testid="battery-finder">
      <div role="tablist" aria-label="Forma de busca" className="inline-flex rounded-md border border-border bg-secondary p-1">
        {(
          [
            ["search", "Buscar pelo nome"],
            ["cascade", "Marca, modelo e ano"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={mode === key}
            data-testid={`finder-mode-${key}-tab`}
            onClick={() => setMode(key)}
            className={cn(
              "h-10 rounded-[5px] px-4 text-sm font-semibold transition-[background-color,color] duration-200",
              mode === key ? "bg-navy-800 text-white" : "text-navy-800 hover:bg-white",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "search" ? (
        <div className="relative mt-5">
          <label htmlFor="finder-search" className="mb-2 block text-sm font-medium text-slate-700">
            Digite o modelo do seu carro (pode incluir o ano)
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="finder-search"
              type="search"
              autoComplete="off"
              role="combobox"
              aria-expanded={open && results.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              placeholder="Ex.: Onix 2022, Compass, HB20 1.0"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
                setActive(-1);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={onKeyDown}
              data-testid="finder-search-input"
              className="h-14 w-full rounded-md border border-input bg-white pl-12 pr-12 text-base text-foreground shadow-[inset_0_1px_2px_rgb(0_0_0/0.04)] transition-[border-color,box-shadow] duration-200 placeholder:text-slate-400 hover:border-navy-600 focus-visible:border-amber-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand/40"
            />
            {searchQ.isFetching && (
              <Loader2 className="absolute right-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-slate-400" aria-label="Buscando" />
            )}
          </div>

          {open && debounced.length >= 2 && !searchQ.isFetching && (
            <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-md border border-border bg-white shadow-[0_20px_50px_-20px_rgb(10_20_56/0.35)]">
              {searchQ.isError ? (
                <p className="p-4 text-sm text-slate-600" data-testid="finder-search-error">
                  Não foi possível consultar o catálogo agora. Tente de novo ou fale com a equipe no WhatsApp.
                </p>
              ) : results.length === 0 ? (
                <div className="space-y-3 p-4" data-testid="finder-search-empty">
                  <p className="text-sm text-slate-700">
                    Não encontramos <strong>“{debounced}”</strong> no catálogo. A equipe identifica a bateria certa pelo WhatsApp.
                  </p>
                  <WaButton message={WA_MESSAGES.notFound + debounced} testId="finder-search-empty-whatsapp-button" size="sm">
                    Perguntar à equipe
                  </WaButton>
                </div>
              ) : (
                <ul id={listId} role="listbox" className="max-h-80 overflow-auto py-1" data-testid="finder-search-results">
                  {results.map((v, i) => (
                    <li
                      key={v.id}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={active === i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => go(v, typedYear)}
                      onMouseEnter={() => setActive(i)}
                      data-testid={`finder-search-result-${i}`}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 border-l-2 px-4 py-3 transition-colors duration-150",
                        active === i ? "border-amber-brand bg-amber-50" : "border-transparent",
                      )}
                    >
                      <span>
                        <span className="block font-semibold text-navy-900">{vehicleName(v)}</span>
                        <span className="block text-sm text-slate-600">{vehicleSpec(v)}</span>
                      </span>
                      <span className="shrink-0 font-mono text-xs text-slate-500">{yearRange(v)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        <div ref={cascadeRef} className="mt-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="finder-make" className="mb-2 block text-sm font-medium text-slate-700">
                <span className="mr-1.5 font-mono text-xs text-amber-brand-hover">1</span>Marca
              </label>
              <select
                id="finder-make"
                className={selectCls}
                value={make}
                disabled={catalogDown}
                onChange={(e) => {
                  setMake(e.target.value);
                  setModel("");
                  setYear("");
                }}
                data-testid="finder-make-select"
              >
                <option value="">Selecione</option>
                {(makesQ.data ?? []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="finder-model" className="mb-2 block text-sm font-medium text-slate-700">
                <span className="mr-1.5 font-mono text-xs text-amber-brand-hover">2</span>Modelo
              </label>
              <select
                id="finder-model"
                className={selectCls}
                value={model}
                disabled={!make}
                onChange={(e) => {
                  setModel(e.target.value);
                  setYear("");
                }}
                data-testid="finder-model-select"
              >
                <option value="">{make ? "Selecione" : "Escolha a marca"}</option>
                {(modelsQ.data ?? []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="finder-year" className="mb-2 block text-sm font-medium text-slate-700">
                <span className="mr-1.5 font-mono text-xs text-amber-brand-hover">3</span>Ano
              </label>
              <select
                id="finder-year"
                className={selectCls}
                value={year}
                disabled={!model}
                onChange={(e) => setYear(e.target.value)}
                data-testid="finder-year-select"
              >
                <option value="">{model ? "Selecione" : "Escolha o modelo"}</option>
                {(yearsQ.data ?? []).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {year && (
            <div className="mt-5 animate-rise" data-testid="finder-versions">
              <p className="mb-2 text-sm font-medium text-slate-700">
                <span className="mr-1.5 font-mono text-xs text-amber-brand-hover">4</span>Motorização / versão
              </p>
              {versionsQ.isLoading ? (
                <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> Carregando versões…</p>
              ) : (versionsQ.data ?? []).length === 0 ? (
                <p className="text-sm text-slate-600">Nenhuma versão cadastrada para esse ano.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {(versionsQ.data ?? []).map((v, i) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => go(v, Number(year))}
                        data-testid={`finder-version-option-${i}`}
                        className="group flex w-full items-center justify-between gap-3 rounded-md border border-border bg-white px-4 py-3.5 text-left transition-[border-color,background-color] duration-200 hover:border-navy-800 hover:bg-slate-50"
                      >
                        <span>
                          <span className="block font-semibold text-navy-900">{v.engine}{v.version ? ` · ${v.version}` : ""}</span>
                          <span className="block text-xs text-slate-500">
                            {yearRange(v)} · {v.start_stop ? "com Start-Stop" : "sem Start-Stop"}
                          </span>
                        </span>
                        <ArrowRight className="size-4 text-navy-800 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {catalogDown && (
        <p className="mt-4 text-sm text-slate-600" data-testid="finder-catalog-error">
          O catálogo está indisponível no momento. Fale direto com a equipe pelo WhatsApp que identificamos a bateria para você.
        </p>
      )}

      {(popularQ.data ?? []).length > 0 && (
        <div className="mt-6">
          <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">Mais procurados</p>
          <ul className="flex flex-wrap gap-2" data-testid="finder-popular-list">
            {(popularQ.data ?? []).map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => pickPopular(v)}
                  data-testid={`finder-popular-${v.model.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="h-9 rounded-full border border-border bg-white px-3.5 text-sm font-medium text-navy-800 transition-[border-color,background-color,color] duration-200 hover:border-navy-800 hover:bg-navy-800 hover:text-white"
                >
                  {vehicleName(v)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
