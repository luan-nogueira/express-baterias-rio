import type { Battery, Technology, Vehicle } from "@/lib/types";

export const vehicleName = (v: Vehicle) => `${v.make} ${v.model}`;
export const vehicleSpec = (v: Vehicle) => [v.engine, v.version].filter(Boolean).join(" · ");
export const yearRange = (v: Vehicle) => (v.year_from === v.year_to ? `${v.year_from}` : `${v.year_from}–${v.year_to}`);

export const POLARITY_LABEL: Record<Battery["polarity"], string> = {
  D: "Positivo à direita (D)",
  E: "Positivo à esquerda (E)",
};

export const TECH_INFO: Record<Technology, string> = {
  Convencional: "Chumbo-ácido selada, para veículos sem sistema Start-Stop.",
  EFB: "Bateria reforçada para Start-Stop: aguenta muito mais ciclos de partida que a convencional.",
  AGM: "Eletrólito absorvido em fibra de vidro. Indicada para Start-Stop avançado e alto consumo elétrico.",
};

export function dimensions(b: Battery): string | null {
  if (!b.length_mm || !b.width_mm || !b.height_mm) return null;
  return `${b.length_mm} × ${b.width_mm} × ${b.height_mm} mm`;
}

export function differenceNote(primary: Battery, alt: Battery): string {
  const parts: string[] = [];
  if (alt.technology !== primary.technology) parts.push(`tecnologia ${alt.technology} (a principal é ${primary.technology})`);
  if (alt.ah !== primary.ah)
    parts.push(`${alt.ah > primary.ah ? "mais" : "menos"} reserva de energia: ${alt.ah}Ah contra ${primary.ah}Ah`);
  if (alt.cca && primary.cca && alt.cca !== primary.cca)
    parts.push(`partida a frio de ${alt.cca}A contra ${primary.cca}A`);
  if (alt.polarity !== primary.polarity) parts.push("polaridade invertida");
  if (alt.length_mm && primary.length_mm && alt.length_mm !== primary.length_mm)
    parts.push(`caixa ${alt.length_mm > primary.length_mm ? "maior" : "menor"} (${alt.length_mm} mm de comprimento)`);
  return parts.length
    ? `Diferenças em relação à indicação principal: ${parts.join("; ")}.`
    : "Mesmas especificações principais da indicação; muda a marca ou a linha.";
}

export function finderWhatsappMessage(v: Vehicle, battery: Battery | null, year: number | null): string {
  const lines = [
    "Olá, Express Baterias! Pesquisei minha bateria no site.",
    `Veículo: ${v.make} ${v.model} ${v.engine}${v.version ? ` ${v.version}` : ""}`,
    `Ano: ${year ?? `${yearRange(v)} (confirmar o ano exato)`}`,
    `Start-Stop: ${v.start_stop ? "sim" : "não"}`,
  ];
  if (battery) {
    lines.push(
      `Bateria indicada: ${battery.technology} ${battery.ah}Ah${battery.brand !== "A confirmar" ? ` ${battery.brand}` : ""} — código ${battery.code}`,
    );
    lines.push("Podem confirmar a compatibilidade, o preço e a disponibilidade?");
  } else {
    lines.push("O site não mostrou uma bateria para esse veículo. Podem me ajudar a identificar?");
  }
  return lines.join("\n");
}

export const formatBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
