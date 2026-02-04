import { useState, useCallback } from "react";
import type { GenerateOption } from "../components/meeting-detail/AIGenerateButton";

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

export interface AIAgendaSubitem {
  title: string;
  description: string;
}

export interface AIAgendaItem {
  number: number;
  title: string;
  status: "discussed" | "action_pending";
  subitems: AIAgendaSubitem[];
}

export interface AIDecision {
  content: string;
  type: "normal" | "warning";
}

export interface AIResponse {
  summary?: string;
  clientContext?: {
    points: AIContextPoint[];
  };
  highlights?: AIHighlight[];
  agenda?: AIAgendaItem[];
  decisions?: AIDecision[];
}

export interface AIRequestPayload {
  text: string;
  clientName: string;
  meetingDate: string;
  generate: {
    summary: boolean;
    agenda: boolean;
    decisions: boolean;
  };
}

interface UseAISummaryReturn {
  isLoading: boolean;
  error: string | null;
  processWithAI: (
    text: string,
    clientName: string,
    meetingDate: string,
    options: GenerateOption[],
  ) => Promise<AIResponse | null>;
  clearError: () => void;
}

export function useAISummary(): UseAISummaryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processWithAI = useCallback(
    async (
      text: string,
      clientName: string,
      meetingDate: string,
      options: GenerateOption[],
    ): Promise<AIResponse | null> => {
      setIsLoading(true);
      setError(null);

      const payload: AIRequestPayload = {
        text,
        clientName,
        meetingDate,
        generate: {
          summary: options.includes("summary"),
          agenda: options.includes("agenda"),
          decisions: options.includes("decisions"),
        },
      };

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

        let data = await response.json();

        // Handle array response (n8n sometimes returns array)
        if (Array.isArray(data)) {
          data = data[0];
        }

        // Validate response structure based on what was requested
        const hasRequestedData =
          (options.includes("summary") ? data.summary : true) ||
          (options.includes("agenda") ? data.agenda : true) ||
          (options.includes("decisions") ? data.decisions : true);

        if (!hasRequestedData) {
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
    },
    [],
  );

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
