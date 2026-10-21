import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { apiDelete, apiPost, apiPut } from "@/lib/api";
import type { Battery, Vehicle, VehicleIn } from "@/lib/types";
import { yearRange } from "@/lib/finder";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EMPTY: VehicleIn = {
  make: "", model: "", engine: "", version: "", year_from: new Date().getFullYear(), year_to: new Date().getFullYear(),
  start_stop: false, battery_ids: [], validated: false, popular: false, notes: "",
};

const strip = ({ id: _id, ...rest }: Vehicle): VehicleIn => rest;

export function VehiclesPanel({ vehicles, batteries, loading }: { vehicles: Vehicle[]; batteries: Battery[]; loading: boolean }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VehicleIn>(EMPTY);
  const byId = useMemo(() => Object.fromEntries(batteries.map((b) => [b.id, b])), [batteries]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    qc.invalidateQueries({ queryKey: ["finder"] });
  };
  const save = useMutation({
    mutationFn: ({ id, body }: { id: string | null; body: VehicleIn }) =>
      id ? apiPut<Vehicle>(`/admin/vehicles/${id}`, body) : apiPost<Vehicle>("/admin/vehicles", body),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success("Aplicação salva");
    },
    onError: () => toast.error("Verifique os campos (anos, marca, modelo e motor)"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/vehicles/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Veículo excluído");
    },
  });

  const shown = vehicles.filter((v) => `${v.make} ${v.model} ${v.engine} ${v.version}`.toLowerCase().includes(filter.toLowerCase()));
  const toggleBattery = (id: string) =>
    setForm((f) => ({ ...f, battery_ids: f.battery_ids.includes(id) ? f.battery_ids.filter((x) => x !== id) : [...f.battery_ids, id] }));
  const text = (k: "make" | "model" | "engine" | "version" | "notes") => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input placeholder="Filtrar por marca, modelo ou motor" value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 max-w-sm bg-white" data-testid="admin-vehicle-filter-input" />
        <Button onClick={() => { setEditing(null); setForm(EMPTY); setOpen(true); }} data-testid="admin-vehicle-new-button"><Plus className="size-4" /> Novo veículo</Button>
      </div>
      <div className="rounded-md bg-white" data-testid="admin-vehicles-table">
        {loading ? <p className="p-6 text-sm text-slate-500">Carregando…</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead><TableHead>Motor / versão</TableHead><TableHead>Anos</TableHead><TableHead>Start-Stop</TableHead>
                <TableHead>Baterias (ordem)</TableHead><TableHead>Validação</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((v) => (
                <TableRow key={v.id} data-testid={`admin-vehicle-row-${v.id}`}>
                  <TableCell className="font-medium">{v.make} {v.model}{v.popular && <Badge variant="secondary" className="ml-2">popular</Badge>}</TableCell>
                  <TableCell>{v.engine}{v.version && <span className="block text-xs text-slate-500">{v.version}</span>}</TableCell>
                  <TableCell className="font-mono text-xs">{yearRange(v)}</TableCell>
                  <TableCell>{v.start_stop ? "Sim" : "Não"}</TableCell>
                  <TableCell className="font-mono text-xs">{v.battery_ids.map((id) => byId[id]?.code ?? "?").join(", ") || "—"}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => save.mutate({ id: v.id, body: { ...strip(v), validated: !v.validated } })}
                      data-testid={`admin-vehicle-validate-${v.id}`}
                      className={v.validated ? "inline-flex items-center gap-1 rounded-sm bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800" : "rounded-sm bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-200"}
                    >
                      {v.validated ? <><CheckCircle2 className="size-3.5" /> Validada</> : "Aguardando — validar"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={() => { setEditing(v); setForm(strip(v)); setOpen(true); }} data-testid={`admin-vehicle-edit-${v.id}`}><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Excluir" onClick={() => { if (confirm(`Excluir ${v.make} ${v.model} ${v.engine}?`)) remove.mutate(v.id); }} data-testid={`admin-vehicle-delete-${v.id}`}><Trash2 className="size-4 text-red-600" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? `Editar ${editing.make} ${editing.model}` : "Novo veículo / aplicação"}</DialogTitle></DialogHeader>
          <form
            id="vehicle-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.make.trim() || !form.model.trim() || !form.engine.trim()) { toast.error("Marca, modelo e motor são obrigatórios"); return; }
              if (form.year_to < form.year_from) { toast.error("Ano final deve ser maior ou igual ao inicial"); return; }
              save.mutate({ id: editing?.id ?? null, body: form });
            }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <div className="space-y-1"><Label htmlFor="veh-make" className="text-xs">Marca *</Label><Input id="veh-make" value={form.make} onChange={text("make")} className="h-10" data-testid="vehicle-form-make-input" /></div>
            <div className="space-y-1"><Label htmlFor="veh-model" className="text-xs">Modelo *</Label><Input id="veh-model" value={form.model} onChange={text("model")} className="h-10" data-testid="vehicle-form-model-input" /></div>
            <div className="space-y-1"><Label htmlFor="veh-engine" className="text-xs">Motorização *</Label><Input id="veh-engine" placeholder="1.0 Turbo Flex" value={form.engine} onChange={text("engine")} className="h-10" data-testid="vehicle-form-engine-input" /></div>
            <div className="space-y-1"><Label htmlFor="veh-version" className="text-xs">Versão</Label><Input id="veh-version" value={form.version} onChange={text("version")} className="h-10" data-testid="vehicle-form-version-input" /></div>
            <div className="space-y-1"><Label htmlFor="veh-from" className="text-xs">Ano inicial</Label><Input id="veh-from" type="number" value={form.year_from} onChange={(e) => setForm((f) => ({ ...f, year_from: Number(e.target.value) }))} className="h-10" data-testid="vehicle-form-year-from-input" /></div>
            <div className="space-y-1"><Label htmlFor="veh-to" className="text-xs">Ano final</Label><Input id="veh-to" type="number" value={form.year_to} onChange={(e) => setForm((f) => ({ ...f, year_to: Number(e.target.value) }))} className="h-10" data-testid="vehicle-form-year-to-input" /></div>
            <div className="flex flex-wrap gap-5 sm:col-span-2">
              {(["start_stop", "popular", "validated"] as const).map((k) => (
                <label key={k} className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.checked }))} className="size-4 accent-navy-800" data-testid={`vehicle-form-${k}-checkbox`} />
                  {k === "start_stop" ? "Tem Start-Stop" : k === "popular" ? "Mostrar em “mais procurados”" : "Aplicação validada pela equipe"}
                </label>
              ))}
            </div>
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-xs font-medium">Baterias compatíveis — a ordem de marcação define a indicação principal</legend>
              <div className="grid max-h-56 gap-1.5 overflow-y-auto rounded-md border border-border p-2 sm:grid-cols-2">
                {batteries.map((b) => {
                  const idx = form.battery_ids.indexOf(b.id);
                  return (
                    <label key={b.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                      <input type="checkbox" checked={idx >= 0} onChange={() => toggleBattery(b.id)} className="size-4 accent-navy-800" data-testid={`vehicle-form-battery-${b.code}`} />
                      <span className="font-mono text-xs">{b.code}</span>
                      <span className="text-xs text-slate-500">{b.technology} {b.ah}Ah</span>
                      {idx >= 0 && <span className="ml-auto rounded-sm bg-amber-brand px-1.5 font-mono text-[10px] font-bold text-navy-900">{idx + 1}º</span>}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="space-y-1 sm:col-span-2"><Label htmlFor="veh-notes" className="text-xs">Observações</Label><Input id="veh-notes" value={form.notes} onChange={text("notes")} className="h-10" data-testid="vehicle-form-notes-input" /></div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="vehicle-form-cancel-button">Cancelar</Button>
            <Button type="submit" form="vehicle-form" disabled={save.isPending} data-testid="vehicle-form-save-button">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
