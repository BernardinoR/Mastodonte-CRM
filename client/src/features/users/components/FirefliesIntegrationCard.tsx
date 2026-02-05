import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Loader2, Check, X, ExternalLink, Eye, EyeOff, Mic2, Webhook, Copy } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useToast } from "@/shared/hooks/use-toast";
import { queryClient } from "@/shared/lib/queryClient";
import { useCurrentUser, hasRole } from "../hooks/useCurrentUser";

export default function FirefliesIntegrationCard() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.user;

  const [editing, setEditing] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);

  const isConsultor = hasRole(currentUser, "consultor");

  const hasApiKey = !!currentUser?.firefliesApiKey;

  const maskApiKey = (key: string | null) => {
    if (!key) return "";
    if (key.length <= 8) return "****";
    return `****...${key.slice(-4)}`;
  };

  const testApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const token = await getToken();
      const res = await fetch("/api/users/fireflies-key/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey }),
      });
      if (!res.ok) throw new Error("Failed to test API key");
      return res.json();
    },
  });

  const saveApiKeyMutation = useMutation({
    mutationFn: async (firefliesApiKey: string | null) => {
      const token = await getToken();
      const res = await fetch("/api/users/fireflies-key", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firefliesApiKey }),
      });
      if (!res.ok) throw new Error("Failed to save API key");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "API Key do Fireflies salva com sucesso" });
      setEditing(false);
      setApiKeyValue("");
    },
    onError: () => {
      toast({ title: "Erro ao salvar API Key", variant: "destructive" });
    },
  });

  const handleStartEdit = () => {
    setApiKeyValue("");
    setEditing(true);
  };

  const handleTestConnection = async () => {
    const trimmed = apiKeyValue.trim();
    if (!trimmed) {
      toast({ title: "Digite uma API Key", variant: "destructive" });
      return;
    }

    setTesting(true);
    try {
      const result = await testApiKeyMutation.mutateAsync(trimmed);
      if (result.valid) {
        toast({
          title: "Conexao bem sucedida!",
          description: result.email ? `Conectado como: ${result.email}` : "API Key valida",
        });
      } else {
        toast({
          title: "API Key invalida",
          description: result.error || "Verifique a chave e tente novamente",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Erro ao testar conexao", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = apiKeyValue.trim();
    if (!trimmed) {
      toast({ title: "Digite uma API Key", variant: "destructive" });
      return;
    }
    saveApiKeyMutation.mutate(trimmed);
  };

  const handleRemove = () => {
    saveApiKeyMutation.mutate(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setApiKeyValue("");
  };

  if (!isConsultor) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic2 className="h-5 w-5" />
          Fireflies.ai
        </CardTitle>
        <CardDescription>
          Conecte sua conta Fireflies para sincronizar transcricoes de reunioes automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            {editing ? (
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyValue}
                    onChange={(e) => setApiKeyValue(e.target.value)}
                    placeholder="Cole sua API Key do Fireflies aqui"
                    className="pr-10"
                    data-testid="input-fireflies-api-key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testing || !apiKeyValue.trim()}
                    data-testid="button-test-fireflies"
                  >
                    {testing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Testar Conexao
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saveApiKeyMutation.isPending || !apiKeyValue.trim()}
                    data-testid="button-save-fireflies"
                  >
                    {saveApiKeyMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Salvar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saveApiKeyMutation.isPending}
                    data-testid="button-cancel-fireflies"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm" data-testid="text-fireflies-status">
                  {hasApiKey ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                      Conectado {maskApiKey(currentUser?.firefliesApiKey ?? null)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Nao configurado</span>
                  )}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleStartEdit}
                    data-testid="button-edit-fireflies"
                  >
                    {hasApiKey ? "Alterar" : "Configurar"}
                  </Button>
                  {hasApiKey && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRemove}
                      disabled={saveApiKeyMutation.isPending}
                      className="text-destructive hover:text-destructive"
                      data-testid="button-remove-fireflies"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {hasApiKey && !editing && (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Webhook className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Webhook URL</span>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                Configure este webhook no Fireflies para receber transcricoes automaticamente:
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value="https://webhooks.snowealth.com.br/webhook/fireflies-transcript"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "https://webhooks.snowealth.com.br/webhook/fireflies-transcript",
                    );
                    toast({ title: "URL copiada!" });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                No Fireflies: Settings → Integrations → Webhooks → Add Webhook
              </p>
            </div>
          )}

          <div className="rounded-lg border border-dashed p-3">
            <p className="text-xs text-muted-foreground">
              Para obter sua API Key, acesse o painel do Fireflies e va em{" "}
              <strong>Settings &gt; Integrations &gt; API</strong>.
            </p>
            <a
              href="https://app.fireflies.ai/integrations/custom/fireflies"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Como obter sua API Key
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
