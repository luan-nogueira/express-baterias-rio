import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { apiPost, ApiError } from "@/lib/api";
import type { Quote, QuoteIn } from "@/lib/types";
import { NEEDS, NEIGHBORHOODS, waLink } from "@/lib/contact";
import { cn } from "@/lib/utils";

type Field = "name" | "phone" | "vehicle" | "neighborhood" | "need";
type Errors = Partial<Record<Field | "other", string>>;

const inputCls =
  "h-12 w-full rounded-md border bg-white px-3.5 text-[15px] text-foreground transition-[border-color,box-shadow] duration-200 placeholder:text-slate-400 hover:border-navy-600 focus-visible:border-amber-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand/40";

function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

function buildMessage(q: QuoteIn) {
  return [
    "Olá, Express Baterias! Acabei de pedir um orçamento pelo site.",
    `Nome: ${q.name}`,
    `Veículo: ${q.vehicle}`,
    `Bairro: ${q.neighborhood}`,
    `Preciso de: ${q.need}`,
    q.message ? `Obs.: ${q.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function QuoteForm() {
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "", neighborhood: "", other: "", need: NEEDS[0], message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: k === "phone" ? maskPhone(e.target.value) : e.target.value }));

  const mutation = useMutation({
    mutationFn: (body: QuoteIn) => apiPost<Quote>("/quotes", body),
    onSuccess: (_q, body) => {
      const url = waLink(buildMessage(body));
      setSentUrl(url);
      toast.success("Pedido recebido! Abrindo o WhatsApp…");
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError && err.status === 422
          ? "Confira os dados informados e tente novamente."
          : "Não conseguimos enviar agora. Chame direto no WhatsApp.";
      toast.error(msg);
    },
  });

  const validate = (): Errors => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "Informe seu nome.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) e.phone = "Informe o WhatsApp com DDD.";
    if (form.vehicle.trim().length < 2) e.vehicle = "Informe o modelo e o ano do veículo.";
    if (!form.neighborhood) e.neighborhood = "Selecione o bairro.";
    if (form.neighborhood === "Outro" && form.other.trim().length < 2) e.other = "Digite o nome do bairro.";
    return e;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    mutation.mutate({
      name: form.name.trim(),
      phone: form.phone,
      vehicle: form.vehicle.trim(),
      neighborhood: form.neighborhood === "Outro" ? form.other.trim() : form.neighborhood,
      need: form.need,
      message: form.message.trim(),
      vehicle_id: null,
      battery_code: null,
      source: "formulario-site",
    });
  };

  if (sentUrl) {
    return (
      <div className="rounded-md border border-emerald-200 bg-white p-6 sm:p-8" data-testid="quote-success" role="status">
        <CheckCircle2 className="size-8 text-emerald-600" aria-hidden="true" />
        <h3 className="mt-3 text-2xl font-bold text-navy-900">Pedido recebido</h3>
        <p className="mt-2 text-slate-600">
          Seus dados chegaram para a equipe. Se a conversa do WhatsApp não abriu automaticamente, toque no botão abaixo.
        </p>
        <a
          href={sentUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="quote-success-whatsapp-link"
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-md bg-wa px-5 font-semibold text-[#04260E] transition-colors hover:bg-[#2EE071]"
        >
          <SiWhatsapp size={18} aria-hidden="true" /> Continuar no WhatsApp
        </a>
        <button
          type="button"
          onClick={() => {
            setSentUrl(null);
            setForm((f) => ({ ...f, vehicle: "", message: "" }));
          }}
          data-testid="quote-new-button"
          className="ml-4 text-sm font-medium text-navy-800 underline-offset-4 hover:underline"
        >
          Novo pedido
        </button>
      </div>
    );
  }

  const fieldErr = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`quote-${k}-error`} className="mt-1.5 text-sm text-red-700" data-testid={`quote-${k}-error`}>
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="rounded-md border border-border bg-white p-6 sm:p-8" data-testid="quote-form">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-name" className="mb-1.5 block text-sm font-medium text-slate-700">Nome</label>
          <input id="quote-name" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "quote-name-error" : undefined} className={cn(inputCls, errors.name ? "border-red-500" : "border-input")} data-testid="quote-name-input" />
          {fieldErr("name")}
        </div>
        <div>
          <label htmlFor="quote-phone" className="mb-1.5 block text-sm font-medium text-slate-700">WhatsApp</label>
          <input id="quote-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(21) 9XXXX-XXXX" value={form.phone} onChange={set("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "quote-phone-error" : undefined} className={cn(inputCls, errors.phone ? "border-red-500" : "border-input")} data-testid="quote-phone-input" />
          {fieldErr("phone")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="quote-vehicle" className="mb-1.5 block text-sm font-medium text-slate-700">Veículo (modelo, ano e motor, se souber)</label>
          <input id="quote-vehicle" placeholder="Ex.: Onix 2021 1.0 turbo" value={form.vehicle} onChange={set("vehicle")} aria-invalid={!!errors.vehicle} aria-describedby={errors.vehicle ? "quote-vehicle-error" : undefined} className={cn(inputCls, errors.vehicle ? "border-red-500" : "border-input")} data-testid="quote-vehicle-input" />
          {fieldErr("vehicle")}
        </div>
        <div>
          <label htmlFor="quote-neighborhood" className="mb-1.5 block text-sm font-medium text-slate-700">Bairro onde o veículo está</label>
          <select id="quote-neighborhood" value={form.neighborhood} onChange={set("neighborhood")} aria-invalid={!!errors.neighborhood} className={cn(inputCls, errors.neighborhood ? "border-red-500" : "border-input")} data-testid="quote-neighborhood-select">
            <option value="">Selecione</option>
            {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
            <option value="Outro">Outro bairro</option>
          </select>
          {fieldErr("neighborhood")}
        </div>
        <div>
          <label htmlFor="quote-need" className="mb-1.5 block text-sm font-medium text-slate-700">Do que você precisa?</label>
          <select id="quote-need" value={form.need} onChange={set("need")} className={cn(inputCls, "border-input")} data-testid="quote-need-select">
            {NEEDS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        {form.neighborhood === "Outro" && (
          <div className="sm:col-span-2">
            <label htmlFor="quote-other" className="mb-1.5 block text-sm font-medium text-slate-700">Qual bairro?</label>
            <input id="quote-other" value={form.other} onChange={set("other")} className={cn(inputCls, errors.other ? "border-red-500" : "border-input")} data-testid="quote-other-neighborhood-input" />
            {fieldErr("other")}
          </div>
        )}
        <div className="sm:col-span-2">
          <label htmlFor="quote-message" className="mb-1.5 block text-sm font-medium text-slate-700">
            Observação <span className="font-normal text-slate-500">(opcional)</span>
          </label>
          <textarea id="quote-message" rows={2} maxLength={600} value={form.message} onChange={set("message")} placeholder="Ex.: carro na garagem do prédio, rua tal" className={cn(inputCls, "h-auto border-input py-3")} data-testid="quote-message-input" />
        </div>
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        data-testid="quote-submit-button"
        className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-md bg-wa px-6 text-base font-semibold text-[#04260E] transition-[background-color,opacity] duration-200 hover:bg-[#2EE071] disabled:opacity-70 sm:w-auto"
      >
        {mutation.isPending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <SiWhatsapp size={18} aria-hidden="true" />}
        {mutation.isPending ? "Enviando…" : "Enviar e continuar no WhatsApp"}
      </button>
      <p className="mt-3 text-xs text-slate-500">
        Seus dados ficam registrados para a equipe e a conversa abre no WhatsApp já com as informações preenchidas.
      </p>
    </form>
  );
}
