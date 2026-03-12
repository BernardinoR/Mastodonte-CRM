import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import type { Institution } from "@shared/types";

export function useInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching institutions:", error);
        return;
      }

      setInstitutions(
        (data || []).map((row) => ({
          id: row.id as number,
          name: row.name as string,
          currency: row.currency as Institution["currency"],
          attachmentCount: row.attachment_count as number,
          referenceFiles: (row.reference_files as string[]) ?? [],
        })),
      );
    }
    fetch();
  }, []);

  return { institutions };
}
