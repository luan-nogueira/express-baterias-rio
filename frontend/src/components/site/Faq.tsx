import { Plus } from "lucide-react";

const FAQ = [
  {
    q: "Em quanto tempo vocês chegam?",
    a: "Chegamos em até 30 minutos nas regiões atendidas — Zona Sul, Centro e Barra da Tijuca. O tempo exato depende do trânsito e da distância; informamos a previsão quando você chama no WhatsApp.",
  },
  {
    q: "A entrega e a instalação são cobradas?",
    a: "Não. A entrega e a instalação são grátis: levamos a bateria até onde o veículo está e fazemos a troca no local.",
  },
  {
    q: "Quais as formas de pagamento?",
    a: "Parcelamos em até 10x sem juros. As demais formas de pagamento são confirmadas no atendimento.",
  },
  {
    q: "Achei a mesma bateria mais barata. Vocês cobrem?",
    a: "Sim. Envie o orçamento que você recebeu e fechamos no seu preço.",
  },
  {
    q: "A bateria tem garantia?",
    a: "Sim, a bateria e a instalação têm garantia. O prazo varia conforme o modelo e o fabricante e é informado no orçamento.",
  },
  {
    q: "Como sei qual bateria serve no meu carro?",
    a: "Use o buscador “Encontre sua bateria” ou mande modelo, ano e motor pelo WhatsApp. Antes da venda a equipe confirma a compatibilidade — ano, motor, sistema Start-Stop, polaridade e medidas.",
  },
  {
    q: "Meu carro tem Start-Stop. Precisa de bateria especial?",
    a: "Em geral, sim. Veículos com Start-Stop usam baterias EFB ou AGM, feitas para muitos ciclos de partida. Uma bateria convencional nesses carros costuma durar bem menos.",
  },
  {
    q: "Vocês atendem moto e caminhão?",
    a: "Sim, trabalhamos com baterias para carro, moto e caminhão. Informe o modelo no WhatsApp para receber o orçamento.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-border border-y border-border" data-testid="faq-list">
      {FAQ.map((item, i) => (
        <details key={item.q} className="group" data-testid={`faq-item-${i}`}>
          <summary
            className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden"
            data-testid={`faq-question-${i}`}
          >
            <span className="font-heading text-lg font-semibold text-navy-900">{item.q}</span>
            <Plus className="mt-1 size-5 shrink-0 text-navy-800 transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
          </summary>
          <p className="max-w-2xl pb-6 leading-relaxed text-slate-600" data-testid={`faq-answer-${i}`}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
