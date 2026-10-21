import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { apiPost, ApiError } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import { beginSession } from "@/lib/session";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLogin() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useMutation({
    mutationFn: () => apiPost<AdminUser>("/auth/login", { email, password }),
    onSuccess: () => {
      beginSession();
      // clear() detaches the mounted "me" observer; refetch so the dashboard renders.
      void qc.refetchQueries({ queryKey: ["auth", "me"] });
      window.location.assign("/admin");
    },
  });
  const errMsg =
    login.error instanceof ApiError && login.error.status === 401
      ? "E-mail ou senha incorretos."
      : login.error
        ? "Não foi possível entrar agora. Tente novamente."
        : null;

  return (
    <div className="bg-wiring flex min-h-dvh items-center justify-center bg-navy-900 px-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate();
        }}
        className="w-full max-w-sm border-t-4 border-amber-brand bg-white p-7 shadow-2xl"
        data-testid="admin-login-form"
      >
        <img src="/logo-express.png" alt="Express Baterias Rio" className="h-10 w-auto rounded bg-navy-900 p-1.5" />
        <h1 className="mt-6 text-2xl font-bold text-navy-900">Área restrita</h1>
        <p className="mt-1 text-sm text-slate-600">Catálogo de baterias e pedidos de orçamento.</p>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">E-mail</Label>
            <Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" data-testid="admin-email-input" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Senha</Label>
            <Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" data-testid="admin-password-input" />
          </div>
        </div>
        {errMsg && <p className="mt-4 text-sm text-red-700" role="alert" data-testid="admin-login-error">{errMsg}</p>}
        <button
          type="submit"
          disabled={login.isPending}
          data-testid="admin-login-button"
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-navy-800 font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-70"
        >
          {login.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Entrar
        </button>
        <Link to="/" data-testid="admin-back-link" className="mt-4 block text-center text-sm text-slate-500 hover:text-navy-800">← Voltar ao site</Link>
      </form>
    </div>
  );
}
