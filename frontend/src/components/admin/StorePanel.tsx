import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { apiGet, apiPut, errorDetail } from "@/lib/api";
import type { DayCode, HoursRule, StoreInfo } from "@/lib/types";
import { DAYS, formatRule } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const EMPTY: StoreInfo = { street_address: "", neighborhood: "", city: "Rio de Janeiro", state: "RJ", postal_code: "", hours: [], hours_note: "" };

export function StorePanel() {
  const q = useQuery({ queryKey: ["store"], queryFn: () => apiGet<StoreInfo>("/store") });
  if (q.isLoading) return <p className="text-sm text-slate-500" data-testid="admin-store-loading">Carregando…</p>;
  if (q.isError) return <p className="text-sm text-red-700">Erro ao carregar os dados da loja.</p>;
  return <StoreForm initial={q.data ?? EMPTY} />;
}

function StoreForm({ initial }: { initial: StoreInfo }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<StoreInfo>(initial);

  const save = useMutation({
    mutationFn: (body: StoreInfo) => apiPut<StoreInfo>("/admin/store", body),
    onSuccess: (data) => {
      qc.setQueryData(["store"], data);
      toast.success("Dados da loja salvos — já aparecem no site e no Google");
    },
    onError: (e) => toast.error(errorDetail(e, "Confira os horários (formato HH:MM) e tente de novo")),
  });

  const text = (k: "street_address" | "neighborhood" | "city" | "state" | "postal_code" | "hours_note") =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setRule = (i: number, patch: Partial<HoursRule>) =>
    setForm((f) => ({ ...f, hours: f.hours.map((h, j) => (j === i ? { ...h, ...patch } : h)) }));
  const toggleDay = (i: number, d: DayCode) => {
    const days = form.hours[i].days;
    setRule(i, { days: days.includes(d) ? days.filter((x) => x !== d) : [...days, d] });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (form.hours.some((h) => h.days.length === 0)) {
          toast.error("Cada horário precisa de pelo menos um dia marcado");
          return;
        }
        save.mutate(form);
      }}
      className="grid gap-6 lg:grid-cols-2"
      data-testid="admin-store-form"
    >
      <section className="space-y-4 rounded-md bg-white p-6">
        <div>
          <h2 className="text-lg font-bold text-navy-900">Endereço da loja</h2>
          <p className="text-sm text-slate-500">Deixe em branco para não exibir. Aparece no rodapé, na seção de atendimento e nos dados do Google.</p>
        </div>
        <div className="space-y-1"><Label htmlFor="st-street" className="text-xs">Rua e número</Label><Input id="st-street" value={form.street_address} onChange={text("street_address")} placeholder="Rua Exemplo, 123 — loja A" className="h-10" data-testid="store-street-input" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1"><Label htmlFor="st-nb" className="text-xs">Bairro</Label><Input id="st-nb" value={form.neighborhood} onChange={text("neighborhood")} className="h-10" data-testid="store-neighborhood-input" /></div>
          <div className="space-y-1"><Label htmlFor="st-cep" className="text-xs">CEP</Label><Input id="st-cep" value={form.postal_code} onChange={text("postal_code")} inputMode="numeric" className="h-10" data-testid="store-cep-input" /></div>
          <div className="space-y-1"><Label htmlFor="st-city" className="text-xs">Cidade</Label><Input id="st-city" value={form.city} onChange={text("city")} className="h-10" data-testid="store-city-input" /></div>
          <div className="space-y-1"><Label htmlFor="st-uf" className="text-xs">UF</Label><Input id="st-uf" maxLength={2} value={form.state} onChange={text("state")} className="h-10" data-testid="store-state-input" /></div>
        </div>
      </section>

      <section className="space-y-4 rounded-md bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Horário de atendimento</h2>
            <p className="text-sm text-slate-500">Sem horários cadastrados, nada é exibido.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, hours: [...f.hours, { days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "08:00", closes: "18:00" }] }))} data-testid="store-add-hours-button">
            <Plus className="size-4" /> Adicionar
          </Button>
        </div>
        {form.hours.map((h, i) => (
          <div key={i} className="space-y-3 rounded-md border border-border p-3" data-testid={`store-hours-rule-${i}`}>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d.code}
                  type="button"
                  aria-pressed={h.days.includes(d.code)}
                  onClick={() => toggleDay(i, d.code)}
                  data-testid={`store-hours-${i}-day-${d.code}`}
                  className={h.days.includes(d.code) ? "h-8 rounded px-2.5 text-xs font-semibold bg-navy-800 text-white" : "h-8 rounded px-2.5 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"}
                >
                  {d.short}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1"><Label htmlFor={`st-open-${i}`} className="text-xs">Abre</Label><Input id={`st-open-${i}`} type="time" value={h.opens} onChange={(e) => setRule(i, { opens: e.target.value })} className="h-9 w-32" data-testid={`store-hours-${i}-opens`} /></div>
              <div className="space-y-1"><Label htmlFor={`st-close-${i}`} className="text-xs">Fecha</Label><Input id={`st-close-${i}`} type="time" value={h.closes === "24:00" ? "23:59" : h.closes} onChange={(e) => setRule(i, { closes: e.target.value })} className="h-9 w-32" data-testid={`store-hours-${i}-closes`} /></div>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Remover horário" onClick={() => setForm((f) => ({ ...f, hours: f.hours.filter((_, j) => j !== i) }))} data-testid={`store-hours-${i}-remove`}><Trash2 className="size-4 text-red-600" /></Button>
              {h.days.length > 0 && <span className="pb-2 text-xs text-slate-500">{formatRule(h)}</span>}
            </div>
          </div>
        ))}
        <div className="space-y-1"><Label htmlFor="st-note" className="text-xs">Observação (opcional)</Label><Input id="st-note" value={form.hours_note} onChange={text("hours_note")} placeholder="Ex.: feriados sob consulta" className="h-10" data-testid="store-hours-note-input" /></div>
      </section>

      <div className="lg:col-span-2">
        <Button type="submit" disabled={save.isPending} data-testid="store-save-button">Salvar dados da loja</Button>
      </div>
    </form>
  );
}
