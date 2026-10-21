import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { WaButton } from "@/components/site/WaButton";
import { PHONE_DISPLAY, PHONE_TEL, WA_MESSAGES } from "@/lib/contact";

const NAV = [
  { label: "Encontre sua bateria", to: "/encontre-sua-bateria", id: "finder" },
  { label: "Serviços", to: "/#servicos", id: "servicos" },
  { label: "Atendimento", to: "/#atendimento", id: "atendimento" },
  { label: "Avaliações", to: "/#avaliacoes", id: "avaliacoes" },
  { label: "Dúvidas", to: "/#duvidas", id: "duvidas" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900/95 backdrop-blur supports-[backdrop-filter]:bg-navy-900/85">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-amber-brand focus:px-3 focus:py-2 focus:text-navy-900"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="shrink-0" data-testid="header-logo-link" aria-label="Express Baterias Rio — página inicial">
          <img src="/logo-express.png" alt="Express Baterias Rio" width={122} height={44} className="h-10 w-auto sm:h-11" />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  data-testid={`nav-${item.id}-link`}
                  className={
                    item.id === "finder"
                      ? "relative mr-2 inline-flex h-10 items-center gap-2 rounded-md border border-amber-brand/50 px-3.5 text-sm font-semibold text-amber-brand transition-colors duration-200 hover:bg-amber-brand hover:text-navy-900"
                      : "inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-slate-200 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={PHONE_TEL}
            data-testid="header-phone-link"
            className="hidden items-center gap-2 font-mono text-sm text-slate-200 transition-colors hover:text-amber-brand md:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
          <WaButton message={WA_MESSAGES.general} testId="header-whatsapp-button" size="sm" className="hidden sm:inline-flex">
            WhatsApp
          </WaButton>
          <a
            href={PHONE_TEL}
            data-testid="header-mobile-call-button"
            aria-label={`Ligar para ${PHONE_DISPLAY}`}
            className="inline-flex size-11 items-center justify-center rounded-md border border-white/15 text-white sm:hidden"
          >
            <Phone className="size-5" aria-hidden="true" />
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              data-testid="mobile-menu-button"
              aria-label="Abrir menu"
              className="inline-flex size-11 items-center justify-center rounded-md border border-white/15 text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm border-l-0 bg-navy-900 p-0 text-white">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-full flex-col px-6 pb-8 pt-16">
                <nav aria-label="Menu móvel">
                  <ul className="divide-y divide-white/10 border-y border-white/10">
                    {NAV.map((item, i) => (
                      <li key={item.id}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          data-testid={`mobile-nav-${item.id}-link`}
                          className="flex items-baseline gap-4 py-4 font-heading text-xl font-semibold transition-colors hover:text-amber-brand"
                        >
                          <span className="font-mono text-xs text-amber-brand">0{i + 1}</span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-auto space-y-3">
                  <WaButton message={WA_MESSAGES.general} testId="mobile-menu-whatsapp-button" size="lg" className="w-full">
                    Chamar no WhatsApp
                  </WaButton>
                  <a
                    href={PHONE_TEL}
                    data-testid="mobile-menu-call-button"
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-md border border-white/20 font-semibold"
                  >
                    <Phone className="size-5" aria-hidden="true" /> Ligar {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
