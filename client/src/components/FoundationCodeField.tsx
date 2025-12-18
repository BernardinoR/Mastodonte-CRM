import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Hash, Check, X, Loader2, RefreshCw, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

  const handleSave = () => {
    const trimmed = draftCode.trim();
    if (trimmed && trimmed !== code) {
      onCodeChange(trimmed);
      setValidationStatus("idle");
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftCode(code);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter") {
      handleSave();
    }
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
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              ref={inputRef}
              value={draftCode}
              onChange={(e) => setDraftCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: 652e3f56-10e6-4423-a667-fdd711f856f2"
              className="h-7 px-2 py-1 bg-[#1a1a1a] border-[#333333] text-foreground text-sm flex-1"
              data-testid="input-foundation-code"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-7 w-7 p-0 text-gray-400 hover:text-foreground"
              data-testid="button-cancel-foundation"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-7 px-2 bg-[#2eaadc] hover:bg-[#259bc5] text-white"
              data-testid="button-save-foundation"
            >
              <Check className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <>
            <span 
              className="text-sm font-medium text-foreground cursor-pointer px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-[#2c2c2c] transition-colors flex items-center gap-2"
              onClick={handleStartEditing}
              data-testid="text-foundation-code"
            >
              {code || "Não informado"}
              {renderValidationIcon()}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStartEditing}
              className="h-6 w-6 p-0 text-gray-500 hover:text-foreground"
              data-testid="button-edit-foundation"
            >
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleValidate}
              disabled={validateMutation.isPending || !code}
              className="h-6 px-2 text-xs border-[#333333] hover:bg-[#2c2c2c]"
              data-testid="button-validate-foundation"
            >
              {validateMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Validar
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
