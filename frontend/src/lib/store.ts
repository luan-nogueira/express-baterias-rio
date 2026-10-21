import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { DayCode, HoursRule, StoreInfo } from "@/lib/types";

export const DAYS: { code: DayCode; short: string; schema: string }[] = [
  { code: "Mo", short: "Seg", schema: "Monday" },
  { code: "Tu", short: "Ter", schema: "Tuesday" },
  { code: "We", short: "Qua", schema: "Wednesday" },
  { code: "Th", short: "Qui", schema: "Thursday" },
  { code: "Fr", short: "Sex", schema: "Friday" },
  { code: "Sa", short: "Sáb", schema: "Saturday" },
  { code: "Su", short: "Dom", schema: "Sunday" },
];

export function formatDays(days: DayCode[]): string {
  const idx = DAYS.map((d) => d.code)
    .map((c, i) => (days.includes(c) ? i : -1))
    .filter((i) => i >= 0);
  if (idx.length === 7) return "Todos os dias";
  const contiguous = idx.length > 2 && idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (contiguous) return `${DAYS[idx[0]].short} a ${DAYS[idx[idx.length - 1]].short}`;
  return idx.map((i) => DAYS[i].short).join(", ");
}

export const formatRule = (r: HoursRule) =>
  r.opens === "00:00" && r.closes === "24:00" ? `${formatDays(r.days)} · 24 horas` : `${formatDays(r.days)} · ${r.opens}–${r.closes}`;

export const hasAddress = (s?: StoreInfo) => !!s && s.street_address.trim().length > 0;
export const hasHours = (s?: StoreInfo) => !!s && s.hours.length > 0;

export function fullAddress(s: StoreInfo): string {
  return [s.street_address, s.neighborhood, `${s.city} – ${s.state}`, s.postal_code].filter((p) => p.trim()).join(", ");
}

// Public store data; failures (e.g. static preview with no backend) simply hide the blocks.
export function useStoreInfo() {
  return useQuery({ queryKey: ["store"], queryFn: () => apiGet<StoreInfo>("/store"), staleTime: 5 * 60_000, retry: 1 });
}
