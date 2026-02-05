import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, AlertCircle } from "lucide-react";
import { queryClient } from "@/shared/lib/queryClient";

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_GOOGLE_CALLBACK_WEBHOOK;

export default function GoogleCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const urlError = params.get("error");

    if (urlError) {
      setError("Autorização negada pelo Google.");
      setTimeout(() => navigate("/profile"), 3000);
      return;
    }

    if (!code || !state) {
      setError("Parâmetros inválidos no callback.");
      setTimeout(() => navigate("/profile"), 3000);
      return;
    }

    async function exchangeCode() {
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, userId: state }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao trocar código: ${response.status}`);
        }

        let data = await response.json();
        if (Array.isArray(data)) {
          data = data[0];
        }

        queryClient.invalidateQueries({ queryKey: ["google-calendar-status"] });
        navigate("/profile");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao conectar Google Calendar";
        setError(msg);
        setTimeout(() => navigate("/profile"), 4000);
      }
    }

    exchangeCode();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-lg text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">Redirecionando para o perfil...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">Conectando Google Calendar...</p>
    </div>
  );
}
