import { Link } from "react-router-dom";
import { SiInstagram, SiWhatsapp } from "@icons-pack/react-simple-icons";
import { MapPin, Phone } from "lucide-react";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  MAPS_URL,
  NEIGHBORHOODS,
  PHONE_DISPLAY,
  PHONE_TEL,
  WA_MESSAGES,
  waLink,
} from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-slate-300" data-testid="site-footer">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <img src="/logo-express.png" alt="Express Baterias Rio" width={150} height={54} loading="lazy" className="h-12 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
            Socorro e troca de bateria automotiva no Rio de Janeiro. Levamos a bateria até você e instalamos no local.
          </p>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-amber-brand">Contato</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href={waLink(WA_MESSAGES.general)} target="_blank" rel="noopener noreferrer" data-testid="footer-whatsapp-link" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                <SiWhatsapp size={16} aria-hidden="true" /> WhatsApp {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={PHONE_TEL} data-testid="footer-phone-link" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                <Phone className="size-4" aria-hidden="true" /> Ligar {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" data-testid="footer-instagram-link" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                <SiInstagram size={16} aria-hidden="true" /> {INSTAGRAM_HANDLE}
              </a>
            </li>
            <li>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" data-testid="footer-maps-link" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                <MapPin className="size-4" aria-hidden="true" /> Ver no Google Maps
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-amber-brand">Bairros atendidos</h2>
          <p className="mt-5 text-sm leading-relaxed text-slate-400">{NEIGHBORHOODS.join(" · ")} e região.</p>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-amber-brand">Navegação</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link to="/encontre-sua-bateria" data-testid="footer-finder-link" className="hover:text-white">Encontre sua bateria</Link></li>
            <li><Link to="/#servicos" data-testid="footer-services-link" className="hover:text-white">Serviços</Link></li>
            <li><Link to="/#orcamento" data-testid="footer-quote-link" className="hover:text-white">Pedir orçamento</Link></li>
            <li><Link to="/#duvidas" data-testid="footer-faq-link" className="hover:text-white">Dúvidas frequentes</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Express Baterias Rio. Todos os direitos reservados.</p>
          <Link to="/admin" data-testid="footer-admin-link" className="hover:text-slate-300">Área restrita</Link>
        </div>
      </div>
    </footer>
  );
}
