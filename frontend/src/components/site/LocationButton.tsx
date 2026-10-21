import { useState } from "react";
import { toast } from "sonner";
import { Loader2, LocateFixed } from "lucide-react";
import { waLink } from "@/lib/contact";
import { cn } from "@/lib/utils";

interface Props {
  testId: string;
  variant?: "solid" | "link";
  className?: string;
}

function openWhatsApp(message: string) {
  const url = waLink(message);
  // After an async geolocation callback some browsers block popups — fall back to same-tab navigation.
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) window.location.href = url;
}

export function LocationButton({ testId, variant = "solid", className }: Props) {
  const [loading, setLoading] = useState(false);

  const send = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Seu navegador não envia localização. Abrimos o WhatsApp para você mandar por lá.");
      openWhatsApp("Olá, Express Baterias! Minha bateria arriou e preciso de socorro. Vou mandar minha localização aqui.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const lat = latitude.toFixed(6);
        const lng = longitude.toFixed(6);
        openWhatsApp(
          [
            "Olá, Express Baterias! Minha bateria arriou e preciso de socorro.",
            `Localização do carro: https://www.google.com/maps?q=${lat},${lng}`,
            `(precisão aproximada: ${Math.round(accuracy)} m)`,
            "Meu carro é: ",
          ].join("\n"),
        );
      },
      (err) => {
        setLoading(false);
        toast.error(
          err.code === err.PERMISSION_DENIED
            ? "Você não permitiu o acesso à localização. Abrimos o WhatsApp para você mandar o endereço."
            : "Não conseguimos obter sua localização agora. Abrimos o WhatsApp para você mandar o endereço.",
        );
        openWhatsApp("Olá, Express Baterias! Minha bateria arriou e preciso de socorro. Estou em (endereço/bairro): ");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const icon = loading ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <LocateFixed className="size-5" aria-hidden="true" />;

  return (
    <button
      type="button"
      onClick={send}
      disabled={loading}
      aria-busy={loading}
      data-testid={testId}
      className={cn(
        variant === "solid"
          ? "inline-flex h-14 items-center justify-center gap-2.5 rounded-md bg-navy-900 px-6 font-semibold text-white transition-[background-color,box-shadow] duration-200 hover:bg-navy-700 hover:shadow-[0_10px_30px_-12px_rgb(10_20_56/0.6)] disabled:opacity-80"
          : "inline-flex items-center gap-2 text-sm font-semibold text-amber-brand transition-colors hover:text-white disabled:opacity-80",
        className,
      )}
    >
      {icon}
      {loading ? "Obtendo localização…" : "Enviar minha localização"}
    </button>
  );
}
