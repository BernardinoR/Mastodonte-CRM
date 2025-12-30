import { useState, useCallback } from "react";

const WEBHOOK_URL = "https://webhooks.snowealth.com.br/webhook/reuniao_resumo";

export interface AIContextPoint {
  icon: string;
  text: string;
}

export interface AIHighlight {
  icon: string;
  text: string;
  type: "normal" | "warning";
}

export interface AIResponse {
  summary: string;
  clientContext: {
    points: AIContextPoint[];
  };
  highlights: AIHighlight[];
}

export interface AIRequestPayload {
  text: string;
  clientName: string;
  meetingDate: string;
}

interface UseAISummaryReturn {
  isLoading: boolean;
  error: string | null;
  processWithAI: (payload: AIRequestPayload) => Promise<AIResponse | null>;
  clearError: () => void;
}

export function useAISummary(): UseAISummaryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processWithAI = useCallback(async (payload: AIRequestPayload): Promise<AIResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.summary || !data.clientContext || !data.highlights) {
        throw new Error("Resposta da IA em formato inválido");
      }

      return data as AIResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao processar com IA";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    processWithAI,
    clearError,
  };
}

