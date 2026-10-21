import { Clock, MapPin } from "lucide-react";
import { formatRule, fullAddress, hasAddress, hasHours, useStoreInfo } from "@/lib/store";
import { MAPS_URL } from "@/lib/contact";
import { cn } from "@/lib/utils";

// Address + opening hours block; renders nothing until the data is registered in /admin.
export function StoreDetails({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { data } = useStoreInfo();
  if (!data || (!hasAddress(data) && !hasHours(data))) return null;
  const muted = tone === "dark" ? "text-slate-400" : "text-slate-600";
  const strong = tone === "dark" ? "text-slate-200" : "text-navy-900";
  return (
    <div className={cn("space-y-4 text-sm", className)} data-testid={`store-details-${tone}`}>
      {hasAddress(data) && (
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("flex items-start gap-2.5 transition-colors hover:underline", strong)}
          data-testid="store-address-link"
        >
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{fullAddress(data)}</span>
        </a>
      )}
      {hasHours(data) && (
        <div className="flex items-start gap-2.5" data-testid="store-hours">
          <Clock className={cn("mt-0.5 size-4 shrink-0", strong)} aria-hidden="true" />
          <ul className="space-y-1">
            {data.hours.map((h, i) => (
              <li key={i} className={strong}>{formatRule(h)}</li>
            ))}
            {data.hours_note && <li className={muted}>{data.hours_note}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
