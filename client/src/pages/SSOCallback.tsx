import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: "#191919" }}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
        <p className="text-[#888] text-sm">Autenticando...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
