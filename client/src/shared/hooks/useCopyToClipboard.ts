import { useToast } from "./use-toast";

export function useCopyToClipboard() {
  const { toast } = useToast();
  return (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copiado!", description: `${label} copiado para a área de transferência` });
  };
}
