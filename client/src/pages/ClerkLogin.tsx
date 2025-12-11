import { SignIn } from "@clerk/clerk-react";

export default function ClerkLogin() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#191919]">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#222] border border-[#333]",
          }
        }}
        fallbackRedirectUrl="/"
      />
    </div>
  );
}
