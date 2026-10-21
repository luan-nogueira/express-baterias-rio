import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Loader2, Trash2, Upload } from "lucide-react";
import { apiDelete, apiUpload, errorDetail } from "@/lib/api";
import type { ImportReport, ReferenceCleanup } from "@/lib/types";
import { Button } from "@/components/ui/button";

const COLUMNS: [string, string][] = [
  ["marca_veiculo *", "Chevrolet"],
  ["modelo *", "Onix"],
  ["motor *", "1.0 Turbo Flex"],
  ["versao", "Premier"],
  ["ano_inicial *", "2020"],
  ["ano_final *", "2025"],
  ["start_stop", "sim / não"],
  ["codigo_bateria *", "código do fabricante"],
  ["marca_bateria", "nome da marca"],
  ["linha", "linha do produto"],
  ["ah *(bateria nova)", "60"],
  ["cca", "480"],
  ["tecnologia", "Convencional / EFB / AGM"],
  ["polaridade", "D / E"],
  ["comprimento_mm · largura_mm · altura_mm", "242 · 175 · 175"],
  ["preco", "499,90 (vazio = sob consulta)"],
  ["estoque", "sim / não"],
];

export function ImportPanel() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [markValidated, setMarkValidated] = useState(true);
  const [report, setReport] = useState<ImportReport | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "batteries"] });
    qc.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    qc.invalidateQueries({ queryKey: ["finder"] });
  };

  const upload = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("file", file as File);
      fd.append("mark_validated", String(markValidated));
      return apiUpload<ImportReport>("/admin/import", fd);
    },
    onSuccess: (r) => {
      setReport(r);
      refresh();
      toast.success("Importação concluída");
    },
    onError: (e) => toast.error(errorDetail(e, "Não foi possível importar o arquivo")),
  });

  const cleanup = useMutation({
    mutationFn: () => apiDelete<ReferenceCleanup>("/admin/reference-batteries"),
    onSuccess: (r) => {
      refresh();
      toast.success(
        `${r.batteries_deleted} baterias de referência removidas.` +
          (r.vehicles_without_battery ? ` ${r.vehicles_without_battery} veículos ficaram sem bateria e mostram "fale com a equipe".` : ""),
      );
    },
    onError: () => toast.error("Não foi possível remover"),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="space-y-5 rounded-md bg-white p-6 lg:col-span-3" data-testid="admin-import-section">
        <div>
          <h2 className="text-lg font-bold text-navy-900">Importar tabela de aplicação</h2>
          <p className="mt-1 text-sm text-slate-600">
            Uma linha por combinação veículo × bateria, em .xlsx ou .csv. Baterias com o mesmo código são atualizadas; as novas são criadas.
            A lista de baterias de cada veículo é substituída pela da planilha, na ordem das linhas (a primeira vira a indicação principal).
          </p>
        </div>
        <a
          href="/api/admin/import/template"
          download
          data-testid="import-template-link"
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:underline"
        >
          <Download className="size-4" aria-hidden="true" /> Baixar planilha modelo (.csv)
        </a>

        <div
          className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-slate-300 p-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) { setFile(f); setReport(null); }
          }}
        >
          <FileSpreadsheet className="size-8 text-slate-400" aria-hidden="true" />
          <p className="text-sm text-slate-600">{file ? <strong className="text-navy-900">{file.name}</strong> : "Arraste a planilha aqui ou escolha o arquivo"}</p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xlsm,.csv"
            className="sr-only"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setReport(null); }}
            data-testid="import-file-input"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} data-testid="import-choose-button">Escolher arquivo</Button>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={markValidated} onChange={(e) => setMarkValidated(e.target.checked)} className="mt-0.5 size-4 accent-navy-800" data-testid="import-validated-checkbox" />
          <span>Marcar os veículos importados como <strong>validados</strong> (use quando a tabela vem do fabricante)</span>
        </label>

        <Button onClick={() => upload.mutate()} disabled={!file || upload.isPending} data-testid="import-submit-button">
          {upload.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Importar
        </Button>

        {report && (
          <div className="rounded-md border border-border bg-slate-50 p-4 text-sm" data-testid="import-report">
            <p className="font-semibold text-navy-900">{report.rows_read} linhas lidas</p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              <li data-testid="import-report-batteries">Baterias: {report.batteries_created} criadas · {report.batteries_updated} atualizadas</li>
              <li data-testid="import-report-vehicles">Veículos: {report.vehicles_created} criados · {report.vehicles_updated} atualizados</li>
            </ul>
            {report.errors.length > 0 && (
              <div className="mt-3" data-testid="import-report-errors">
                <p className="font-semibold text-red-700">{report.errors.length} linha(s) ignorada(s):</p>
                <ul className="mt-1 max-h-48 space-y-0.5 overflow-y-auto font-mono text-xs text-red-800">
                  {report.errors.map((er, i) => <li key={i}>{er.row ? `Linha ${er.row}: ` : ""}{er.message}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-md bg-white p-6">
          <h3 className="font-bold text-navy-900">Colunas</h3>
          <p className="mt-1 text-xs text-slate-500">* obrigatória. Acentos, maiúsculas e espaços nos nomes das colunas são ignorados.</p>
          <dl className="mt-3 divide-y divide-border text-xs">
            {COLUMNS.map(([c, ex]) => (
              <div key={c} className="flex justify-between gap-3 py-1.5">
                <dt className="font-mono text-navy-900">{c}</dt>
                <dd className="text-right text-slate-500">{ex}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-md border border-red-200 bg-white p-6">
          <h3 className="font-bold text-navy-900">Baterias de referência</h3>
          <p className="mt-1 text-sm text-slate-600">
            Remove todas as baterias com código <span className="font-mono">REF-…</span> criadas no lançamento do site. Faça isso depois de importar a tabela real.
          </p>
          <Button
            variant="destructive"
            className="mt-4"
            disabled={cleanup.isPending}
            onClick={() => { if (confirm("Remover todas as baterias REF-…? Os veículos que só tinham essas baterias vão mostrar 'fale com a equipe'.")) cleanup.mutate(); }}
            data-testid="import-delete-reference-button"
          >
            <Trash2 className="size-4" /> Remover baterias de referência
          </Button>
        </section>
      </div>
    </div>
  );
}
