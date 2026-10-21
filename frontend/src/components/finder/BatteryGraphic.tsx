import type { Battery } from "@/lib/types";

// Neutral technical illustration (no brand marks). Replaced by the real product photo once
// an image_url is registered in /admin.
export function BatteryGraphic({ battery, className }: { battery: Battery; className?: string }) {
  if (battery.image_url) {
    return (
      <figure className={className} data-testid="battery-product-photo">
        <img
          src={battery.image_url}
          alt={`Bateria ${battery.brand} ${battery.line} ${battery.ah}Ah, código ${battery.code}`}
          loading="lazy"
          className="aspect-square w-full object-contain"
          data-testid="battery-product-image"
        />
        <figcaption className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-slate-600">Foto do produto</figcaption>
      </figure>
    );
  }
  const plusRight = battery.polarity === "D";
  return (
    <figure className={className} data-testid="battery-illustration">
      <svg viewBox="0 0 220 150" role="img" aria-label={`Ilustração de bateria ${battery.ah}Ah, ${battery.technology}`} className="h-full w-full">
        <rect x="34" y="14" width="26" height="14" rx="2" fill={plusRight ? "#0A1438" : "#FFB900"} />
        <rect x="160" y="14" width="26" height="14" rx="2" fill={plusRight ? "#FFB900" : "#0A1438"} />
        <rect x="12" y="26" width="196" height="112" rx="6" fill="#0C1A4B" />
        <rect x="12" y="26" width="196" height="16" rx="6" fill="#142566" />
        <text x="47" y="62" textAnchor="middle" fill={plusRight ? "#94A3B8" : "#FFB900"} fontSize="20" fontFamily="JetBrains Mono Variable, monospace" fontWeight="700">{plusRight ? "−" : "+"}</text>
        <text x="173" y="62" textAnchor="middle" fill={plusRight ? "#FFB900" : "#94A3B8"} fontSize="20" fontFamily="JetBrains Mono Variable, monospace" fontWeight="700">{plusRight ? "+" : "−"}</text>
        <text x="110" y="98" textAnchor="middle" fill="#FFFFFF" fontSize="30" fontFamily="Outfit Variable, sans-serif" fontWeight="700">{`${battery.ah}Ah`}</text>
        <text x="110" y="122" textAnchor="middle" fill="#FFB900" fontSize="12" letterSpacing="2" fontFamily="JetBrains Mono Variable, monospace">{battery.technology.toUpperCase()}</text>
      </svg>
      <figcaption className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-slate-600">Ilustração técnica</figcaption>
    </figure>
  );
}
