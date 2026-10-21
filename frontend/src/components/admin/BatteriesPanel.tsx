import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { apiDelete, apiPost, apiPut, ApiError } from "@/lib/api";
import type { Battery, BatteryIn, Polarity, Technology } from "@/lib/types";
import { dimensions, formatBRL } from "@/lib/finder";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type FormState = Record<
  "code" | "brand" | "line" | "ah" | "cca" | "length_mm" | "width_mm" | "height_mm" | "image_url" | "price" | "notes",
  string
> & { technology: Technology; polarity: Polarity; in_stock: "" | "sim" | "nao" };

const EMPTY: FormState = {
  code: "", brand: "A confirmar", line: "", ah: "", cca: "", length_mm: "", width_mm: "", height_mm: "",
  image_url: "", price: "", notes: "", technology: "Convencional", polarity: "D", in_stock: "",
};

const toForm = (b: Battery): FormState => ({
  code: b.code, brand: b.brand, line: b.line, ah: String(b.ah), cca: b.cca?.toString() ?? "",
  length_mm: b.length_mm?.toString() ?? "", width_mm: b.width_mm?.toString() ?? "", height_mm: b.height_mm?.toString() ?? "",
  image_url: b.image_url ?? "", price: b.price?.toString() ?? "", notes: b.notes, technology: b.technology, polarity: b.polarity,
  in_stock: b.in_stock === true ? "sim" : b.in_stock === false ? "nao" : "",
});

const num = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));

function toBody(f: FormState): BatteryIn {
  return {
    code: f.code.trim(), brand: f.brand.trim() || "A confirmar", line: f.line.trim(), ah: Number(f.ah),
    cca: num(f.cca), technology: f.technology, polarity: f.polarity,
    length_mm: num(f.length_mm), width_mm: num(f.width_mm), height_mm: num(f.height_mm),
    image_url: f.image_url.trim() || null, price: num(f.price),
    in_stock: f.in_stock === "" ? null : f.in_stock === "sim", notes: f.notes,
  };
}

const sel = "h-10 w-full rounded-md border border-input bg-white px-2.5 text-sm";

export function BatteriesPanel({ batteries, loading }: { batteries: Battery[]; loading: boolean }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Battery | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "batteries"] });
    qc.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    qc.invalidateQueries({ queryKey: ["finder"] });
  };
  const save = useMutation({
    mutationFn: (body: BatteryIn) => (editing ? apiPut<Battery>(`/admin/batteries/${editing.id}`, body) : apiPost<Battery>("/admin/batteries", body)),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success("Bateria salva");
    },
    onError: (e) => toast.error(e instanceof ApiError && e.status === 409 ? "Código já cadastrado" : "Verifique os campos e tente novamente"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/batteries/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Bateria excluída");
    },
  });

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (b: Battery) => { setEditing(b); setForm(toForm(b)); setOpen(true); };
  const f = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const field = (k: keyof FormState, label: string, props: React.ComponentProps<"input"> = {}) => (
    <div className="space-y-1">
      <Label htmlFor={`bat-${k}`} className="text-xs">{label}</Label>
      <Input id={`bat-${k}`} value={form[k] as string} onChange={f(k)} className="h-10" data-testid={`battery-form-${k}-input`} {...props} />
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">{batteries.length} baterias cadastradas</p>
        <Button onClick={openNew} data-testid="admin-battery-new-button"><Plus className="size-4" /> Nova bateria</Button>
      </div>
      <div className="rounded-md bg-white" data-testid="admin-batteries-table">
        {loading ? <p className="p-6 text-sm text-slate-500">Carregando…</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead><TableHead>Marca / linha</TableHead><TableHead>Ah</TableHead><TableHead>CCA</TableHead>
                <TableHead>Tecnologia</TableHead><TableHead>Polo +</TableHead><TableHead>Medidas</TableHead><TableHead>Preço</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batteries.map((b) => (
                <TableRow key={b.id} data-testid={`admin-battery-row-${b.code}`}>
                  <TableCell className="font-mono text-xs font-semibold">{b.code}</TableCell>
                  <TableCell>{b.brand}<span className="block text-xs text-slate-500">{b.line}</span></TableCell>
                  <TableCell className="font-mono">{b.ah}</TableCell>
                  <TableCell className="font-mono">{b.cca ?? "—"}</TableCell>
                  <TableCell>{b.technology}</TableCell>
                  <TableCell>{b.polarity === "D" ? "Direita" : "Esquerda"}</TableCell>
                  <TableCell className="font-mono text-xs">{dimensions(b) ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{b.price != null ? formatBRL(b.price) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" aria-label={`Editar ${b.code}`} onClick={() => openEdit(b)} data-testid={`admin-battery-edit-${b.code}`}><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${b.code}`} onClick={() => { if (confirm(`Excluir a bateria ${b.code}? Ela será removida das aplicações.`)) remove.mutate(b.id); }} data-testid={`admin-battery-delete-${b.code}`}><Trash2 className="size-4 text-red-600" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? `Editar ${editing.code}` : "Nova bateria"}</DialogTitle></DialogHeader>
          <form
            id="battery-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.code.trim() || !(Number(form.ah) > 0)) { toast.error("Código e capacidade (Ah) são obrigatórios"); return; }
              save.mutate(toBody(form));
            }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {field("code", "Código do produto *")}
            {field("brand", "Marca")}
            {field("line", "Linha")}
            {field("ah", "Capacidade (Ah) *", { inputMode: "numeric" })}
            {field("cca", "CCA (A)", { inputMode: "numeric" })}
            <div className="space-y-1">
              <Label htmlFor="bat-technology" className="text-xs">Tecnologia</Label>
              <select id="bat-technology" value={form.technology} onChange={f("technology")} className={sel} data-testid="battery-form-technology-select">
                <option>Convencional</option><option>EFB</option><option>AGM</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="bat-polarity" className="text-xs">Polaridade</Label>
              <select id="bat-polarity" value={form.polarity} onChange={f("polarity")} className={sel} data-testid="battery-form-polarity-select">
                <option value="D">Positivo à direita (D)</option><option value="E">Positivo à esquerda (E)</option>
              </select>
            </div>
            {field("length_mm", "Comprimento (mm)", { inputMode: "numeric" })}
            {field("width_mm", "Largura (mm)", { inputMode: "numeric" })}
            {field("height_mm", "Altura (mm)", { inputMode: "numeric" })}
            {field("price", "Preço (R$) — vazio = sob consulta", { inputMode: "decimal" })}
            <div className="space-y-1">
              <Label htmlFor="bat-in_stock" className="text-xs">Estoque</Label>
              <select id="bat-in_stock" value={form.in_stock} onChange={f("in_stock")} className={sel} data-testid="battery-form-stock-select">
                <option value="">Não informar</option><option value="sim">Em estoque</option><option value="nao">Sem estoque</option>
              </select>
            </div>
            <div className="sm:col-span-3">{field("image_url", "URL da foto real do produto")}</div>
            <div className="sm:col-span-3">{field("notes", "Observações internas")}</div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="battery-form-cancel-button">Cancelar</Button>
            <Button type="submit" form="battery-form" disabled={save.isPending} data-testid="battery-form-save-button">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
