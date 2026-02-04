import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  return (
    <div
      className="flex h-screen items-center justify-center"
      style={{ backgroundColor: "#191919" }}
    >
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-white" />
        <p className="text-sm text-[#888]">Autenticando...</p>
      </div>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
      {/* Required for sign-up flows - Clerk's bot protection */}
      <div id="clerk-captcha" />
    </div>
  );
}
