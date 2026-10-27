import { useState } from "react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Check, Loader2, LocateFixed, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL, waLink } from "@/lib/contact";

type Geo =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; url: string; accuracy: number }
  | { state: "error"; message: string };

const inputCls =
  "h-12 w-full rounded-md border border-input bg-white px-3.5 text-base text-navy-900 placeholder:text-slate-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20";

// The emergency shortcut: car + where it is, sent to WhatsApp in one message.
// Nothing is required, so a stressed customer is never blocked by validation.
export function EmergencyForm() {
  const [car, setCar] = useState("");
  const [address, setAddress] = useState("");
  const [geo, setGeo] = useState<Geo>({ state: "idle" });

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeo({ state: "error", message: "Seu navegador não envia localização. Digite a rua e o bairro abaixo." });
      return;
    }
    setGeo({ state: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGeo({
          state: "ok",
          url: `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`,
          accuracy: Math.round(accuracy),
        });
      },
      (err) =>
        setGeo({
          state: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Sem permissão para a localização. Digite a rua e o bairro abaixo."
              : "Não deu para pegar a localização agora. Digite a rua e o bairro abaixo.",
        }),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const message = [
    "Olá, Express Baterias! Minha bateria arriou e preciso de socorro.",
    `Carro: ${car.trim() || "(vou informar)"}`,
    geo.state === "ok" ? `Localização: ${geo.url}` : null,
    address.trim() ? `${geo.state === "ok" ? "Referência" : "Endereço"}: ${address.trim()}` : null,
    geo.state !== "ok" && !address.trim() ? "Localização: (vou mandar aqui)" : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <form
      className="border-t-4 border-amber-brand bg-white p-5 text-navy-900 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.6)] sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const url = waLink(message);
        if (!window.open(url, "_blank", "noopener,noreferrer")) window.location.href = url;
      }}
      data-testid="emergency-form"
      aria-labelledby="emergency-title"
    >
      <h2 id="emergency-title" className="text-xl font-bold leading-tight">Pedir socorro agora</h2>
      <p className="mt-1 text-sm text-slate-600">Mande o carro e onde ele está. A mensagem já vai pronta para o WhatsApp.</p>

      <div className="mt-4 grid gap-3">
        <div>
          <label htmlFor="emergency-car" className="mb-1.5 block text-sm font-medium text-slate-700">Qual é o carro?</label>
          <input
            id="emergency-car"
            value={car}
            onChange={(e) => setCar(e.target.value)}
            placeholder="Ex.: Onix 2019"
            autoComplete="off"
            className={inputCls}
            data-testid="emergency-car-input"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Onde ele está?</span>
          {geo.state === "ok" ? (
            <p className="flex h-12 items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3.5 text-sm font-semibold text-emerald-800" role="status" data-testid="emergency-geo-ok">
              <Check className="size-5" aria-hidden="true" /> Localização pronta (precisão de {geo.accuracy} m)
            </p>
          ) : (
            <button
              type="button"
              onClick={locate}
              disabled={geo.state === "loading"}
              aria-busy={geo.state === "loading"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-navy-900 px-4 font-semibold text-navy-900 transition-colors hover:bg-navy-900 hover:text-white disabled:opacity-70"
              data-testid="emergency-geo-button"
            >
              {geo.state === "loading" ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <LocateFixed className="size-5" aria-hidden="true" />}
              {geo.state === "loading" ? "Pegando a localização…" : "Usar minha localização"}
            </button>
          )}
          {geo.state === "error" && (
            <p className="mt-1.5 text-sm text-red-700" role="alert" data-testid="emergency-geo-error">{geo.message}</p>
          )}
          <label htmlFor="emergency-address" className="sr-only">Rua e bairro</label>
          <input
            id="emergency-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={geo.state === "ok" ? "Referência (opcional): garagem, nº da vaga…" : "Ou digite a rua e o bairro"}
            autoComplete="street-address"
            className={`${inputCls} mt-2`}
            data-testid="emergency-address-input"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-md bg-wa text-base font-semibold text-[#04260E] transition-colors hover:bg-[#2EE071] active:translate-y-px"
        data-testid="emergency-submit"
      >
        <SiWhatsapp size={20} aria-hidden="true" /> Enviar pelo WhatsApp
      </button>
      <a href={PHONE_TEL} className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-navy-800 hover:text-navy-600" data-testid="emergency-call-link">
        <Phone className="size-4" aria-hidden="true" /> Prefere ligar? {PHONE_DISPLAY}
      </a>
    </form>
  );
}
