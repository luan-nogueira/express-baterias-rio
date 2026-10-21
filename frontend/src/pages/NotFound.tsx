import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";

export default function NotFound() {
  return (
    <SiteLayout>
      <title>Página não encontrada | Express Baterias Rio</title>
      <meta name="robots" content="noindex" />
      <section className="mx-auto max-w-3xl px-5 py-28 sm:px-8" data-testid="not-found-page">
        <p className="font-mono text-sm text-amber-brand-hover">Erro 404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-900">Essa página não existe.</h1>
        <p className="mt-3 text-slate-600">O endereço pode ter mudado. Volte para o início ou use o buscador de bateria.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" data-testid="not-found-home-link" className="inline-flex h-12 items-center rounded-md bg-navy-800 px-5 font-semibold text-white hover:bg-navy-700">Ir para o início</Link>
          <Link to="/encontre-sua-bateria" data-testid="not-found-finder-link" className="inline-flex h-12 items-center rounded-md border border-navy-800 px-5 font-semibold text-navy-800 hover:bg-navy-800 hover:text-white">Encontrar bateria</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
