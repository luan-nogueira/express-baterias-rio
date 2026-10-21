import { ArrowUpRight, Star } from "lucide-react";
import { MAPS_URL } from "@/lib/contact";
import { Reveal } from "@/components/site/Reveal";

// Google reviews published on the current site (Trustindex widget), reproduced verbatim.
const REVIEWS = [
  {
    name: "Sensitive Transportes",
    text: "Quero agradecer toda equipe Express baterias por toda prestatividade. Excelente loja de bateria em Botafogo. O problema não foi bateria e o técnico ficou até resolver o problema. Muito obrigado",
  },
  { name: "Juan Linares", text: "Foi rápido efetivo e um preço justo recomendo a todo mundo, e ainda uma sexta a noite agradecido." },
  { name: "Wesley Assis", text: "Super recomendo, agilidade e profissionalismo e preço justo! Excelente atendimento!" },
  { name: "Alexandre Pereira de Castro", text: "Serviço rápido, eficiente, da melhor qualidade, meu agradecimento ao Eduardo que veio no socorro." },
  { name: "Carlinhos Bernardo", text: "O técnico foi muito atendido e rápido. Recomendo" },
  { name: "Diulle Teixeira", text: "Excelente serviço e atendimento! Recomendo !" },
];

function Stars() {
  return (
    <span className="flex gap-0.5" aria-label="5 estrelas">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4 fill-amber-brand text-amber-brand" aria-hidden="true" />
      ))}
    </span>
  );
}

export function Reviews() {
  const [lead, ...rest] = REVIEWS;
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <Reveal className="lg:col-span-5">
        <figure className="h-full border-l-4 border-amber-brand bg-white p-7 sm:p-9" data-testid="review-featured">
          <Stars />
          <blockquote className="mt-5 font-heading text-2xl font-medium leading-snug text-navy-900 sm:text-[28px]">
            “{lead.text}”
          </blockquote>
          <figcaption className="mt-6 font-mono text-sm text-slate-600">— {lead.name}, via Google</figcaption>
        </figure>
      </Reveal>
      <div className="lg:col-span-7">
        <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {rest.map((r, i) => (
            <li key={r.name} data-testid={`review-item-${i}`}>
              <Reveal delay={i * 0.05}>
                <Stars />
                <p className="mt-3 leading-relaxed text-slate-700">“{r.text}”</p>
                <p className="mt-2 font-mono text-xs text-slate-500">{r.name}</p>
              </Reveal>
            </li>
          ))}
        </ul>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="reviews-google-link"
          className="mt-9 inline-flex items-center gap-1.5 border-b-2 border-amber-brand pb-1 font-semibold text-navy-900 transition-colors hover:text-navy-600"
        >
          Ver todas as avaliações no Google <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
