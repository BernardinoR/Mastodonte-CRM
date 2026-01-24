import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Hash, Check, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/shared/lib/queryClient";
import { useAuth } from "@clerk/clerk-react";

interface FoundationCodeFieldProps {
  code: string;
  onCodeChange: (newCode: string) => void;
}

type ValidationStatus = "idle" | "loading" | "valid" | "invalid";

export function FoundationCodeField({
  code,
  onCodeChange,
}: FoundationCodeFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftCode, setDraftCode] = useState(code);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { getToken } = useAuth();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraftCode(code);
    setValidationStatus("idle");
  }, [code]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const validateMutation = useMutation({
    mutationFn: async (codeToValidate: string) => {
      const token = await getToken();
      const response = await apiRequest(
        "POST", 
        "/api/validate-foundation", 
        { code: codeToValidate },
        { "Authorization": `Bearer ${token}` }
      );
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        setValidationStatus("valid");
        toast({
          title: "Código válido!",
          description: "O código Foundation foi validado com sucesso.",
        });
      } else {
        setValidationStatus("invalid");
        toast({
          title: "Código inválido",
          description: "O código Foundation não foi encontrado.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setValidationStatus("idle");
      toast({
        title: "Erro de conexão",
        description: "O serviço de validação está indisponível. Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handleStartEditing = () => {
    setDraftCode(code);
    setIsEditing(true);
    setValidationStatus("idle");
  };

  const commitChange = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    
    const trimmed = draftCode.trim();
    if (trimmed !== code) {
      onCodeChange(trimmed);
      setValidationStatus("idle");
    }
    setIsEditing(false);
  };

  const cancelEditing = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsEditing(false);
    setDraftCode(code);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      cancelEditing();
    } else if (e.key === "Enter") {
      commitChange();
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      commitChange();
    }, 150);
  };

  const handleValidate = () => {
    if (!code) {
      toast({
        title: "Código vazio",
        description: "Preencha o código Foundation antes de validar.",
        variant: "destructive",
      });
      return;
    }
    setValidationStatus("loading");
    validateMutation.mutate(code);
  };

  const renderValidationIcon = () => {
    switch (validationStatus) {
      case "loading":
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
      case "valid":
        return <Check className="w-4 h-4 text-emerald-500" />;
      case "invalid":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <Hash className="w-3.5 h-3.5" />
        Código Foundation
      </span>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={draftCode}
            onChange={(e) => setDraftCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="UUID do Foundation"
            className="text-sm font-medium text-foreground bg-transparent border-b-2 border-[#2eaadc] outline-none flex-1 min-w-0"
            data-testid="input-foundation-code"
          />
        ) : (
          <>
            <span 
              className="text-sm font-medium text-foreground cursor-pointer px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-[#2c2c2c] transition-colors truncate max-w-[180px]"
              onClick={handleStartEditing}
              title={code || "Não informado"}
              data-testid="text-foundation-code"
            >
              {code || "Não informado"}
            </span>
            {renderValidationIcon()}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleValidate}
              disabled={validateMutation.isPending || !code}
              className="h-5 w-5 p-0 text-gray-500 hover:text-foreground"
              data-testid="button-validate-foundation"
            >
              {validateMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
