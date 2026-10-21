import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api";
import type { Quote, QuoteStatus } from "@/lib/types";

// Opens a chat with the customer (not the shop) so the team can reply from the panel.
function customerWa(q: Quote) {
  const digits = q.phone.replace(/\D/g, "");
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(`Olá ${q.name}, aqui é da Express Baterias Rio sobre seu pedido de orçamento.`)}`;
}
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_LABEL: Record<QuoteStatus, string> = { novo: "Novo", em_atendimento: "Em atendimento", concluido: "Concluído" };

export function QuotesPanel() {
  const qc = useQueryClient();
  const quotes = useQuery({ queryKey: ["admin", "quotes"], queryFn: () => apiGet<Quote[]>("/admin/quotes") });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) => apiPatch<Quote>(`/admin/quotes/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quotes"] });
      toast.success("Status atualizado");
    },
    onError: () => toast.error("Não foi possível atualizar"),
  });

  if (quotes.isLoading) return <p className="text-sm text-slate-500">Carregando pedidos…</p>;
  if (quotes.isError) return <p className="text-sm text-red-700" data-testid="admin-quotes-error">Erro ao carregar pedidos.</p>;
  const list = quotes.data ?? [];
  if (list.length === 0) return <p className="rounded-md bg-white p-6 text-sm text-slate-600" data-testid="admin-quotes-empty">Nenhum pedido recebido ainda.</p>;

  return (
    <div className="rounded-md bg-white" data-testid="admin-quotes-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Bairro</TableHead>
            <TableHead>Necessidade</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((q) => (
            <TableRow key={q.id} data-testid={`admin-quote-row-${q.id}`}>
              <TableCell className="whitespace-nowrap font-mono text-xs">{new Date(q.created_at).toLocaleString("pt-BR")}</TableCell>
              <TableCell>
                <span className="block font-medium">{q.name}</span>
                <a href={customerWa(q)} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-navy-600 hover:underline" data-testid="admin-quote-phone-link">
                  {q.phone}
                </a>
              </TableCell>
              <TableCell className="max-w-[220px] whitespace-normal">
                {q.vehicle}
                {q.message && <span className="block text-xs text-slate-500">{q.message}</span>}
              </TableCell>
              <TableCell>{q.neighborhood}</TableCell>
              <TableCell className="max-w-[200px] whitespace-normal">{q.need}</TableCell>
              <TableCell>
                <select
                  aria-label="Status do pedido"
                  value={q.status}
                  onChange={(e) => update.mutate({ id: q.id, status: e.target.value as QuoteStatus })}
                  className="h-9 rounded-md border border-input bg-white px-2 text-sm"
                  data-testid="admin-quote-status-select"
                >
                  {(Object.keys(STATUS_LABEL) as QuoteStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
