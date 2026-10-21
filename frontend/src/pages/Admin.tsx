import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, LogOut } from "lucide-react";
import { apiGet, ApiError } from "@/lib/api";
import type { AdminUser, Battery, Vehicle } from "@/lib/types";
import { endSession } from "@/lib/session";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { QuotesPanel } from "@/components/admin/QuotesPanel";
import { VehiclesPanel } from "@/components/admin/VehiclesPanel";
import { BatteriesPanel } from "@/components/admin/BatteriesPanel";
import { StorePanel } from "@/components/admin/StorePanel";
import { ImportPanel } from "@/components/admin/ImportPanel";
import { cn } from "@/lib/utils";

type Tab = "quotes" | "vehicles" | "batteries" | "import" | "store";
const TABS: { key: Tab; label: string }[] = [
  { key: "quotes", label: "Pedidos de orçamento" },
  { key: "vehicles", label: "Veículos e aplicações" },
  { key: "batteries", label: "Baterias" },
  { key: "import", label: "Importar planilha" },
  { key: "store", label: "Dados da loja" },
];

function Dashboard({ user }: { user: AdminUser }) {
  const [tab, setTab] = useState<Tab>("quotes");
  const vehicles = useQuery({ queryKey: ["admin", "vehicles"], queryFn: () => apiGet<Vehicle[]>("/admin/vehicles") });
  const batteries = useQuery({ queryKey: ["admin", "batteries"], queryFn: () => apiGet<Battery[]>("/admin/batteries") });
  const pending = (vehicles.data ?? []).filter((v) => !v.validated).length;

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" data-testid="admin-site-link"><img src="/logo-express.png" alt="Express Baterias Rio" className="h-9 w-auto" /></Link>
            <span className="hidden font-mono text-xs uppercase tracking-[0.18em] text-amber-brand sm:inline">Painel</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-300 sm:inline" data-testid="admin-user-email">{user.email}</span>
            <button
              type="button"
              onClick={() => endSession("/admin")}
              data-testid="admin-logout-button"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-white/20 px-3 hover:bg-white/10"
            >
              <LogOut className="size-4" aria-hidden="true" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {pending > 0 && (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" data-testid="admin-pending-banner">
            <strong>{pending} de {vehicles.data?.length} aplicações aguardam validação técnica.</strong> Elas aparecem no site com o aviso
            “aguardando validação”. Confira ano, motor, Start-Stop, polaridade e medidas e marque como validada em “Veículos e aplicações”.
            Marcas, códigos reais, CCA, preço e estoque das baterias de referência (código REF-…) também precisam ser preenchidos — use “Importar planilha”.
          </div>
        )}
        <div role="tablist" className="mb-6 flex flex-wrap gap-1 border-b border-slate-300">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              data-testid={`admin-tab-${t.key}`}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                tab === t.key ? "border-amber-brand text-navy-900" : "border-transparent text-slate-500 hover:text-navy-900",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "quotes" && <QuotesPanel />}
        {tab === "vehicles" && <VehiclesPanel vehicles={vehicles.data ?? []} batteries={batteries.data ?? []} loading={vehicles.isLoading} />}
        {tab === "batteries" && <BatteriesPanel batteries={batteries.data ?? []} loading={batteries.isLoading} />}
        {tab === "import" && <ImportPanel />}
        {tab === "store" && <StorePanel />}
      </div>
    </div>
  );
}

export default function Admin() {
  const me = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiGet<AdminUser>("/auth/me"),
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 1,
  });

  return (
    <>
      <title>Painel administrativo | Express Baterias Rio</title>
      <meta name="robots" content="noindex, nofollow" />
      {me.isLoading ? (
        <div className="flex min-h-dvh items-center justify-center bg-navy-900 text-white" data-testid="admin-loading">
          <Loader2 className="size-6 animate-spin" aria-label="Carregando" />
        </div>
      ) : me.data && !me.isError ? (
        <Dashboard user={me.data} />
      ) : (
        <AdminLogin />
      )}
    </>
  );
}
