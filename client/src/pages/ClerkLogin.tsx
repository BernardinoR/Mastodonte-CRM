import { SignIn } from "@clerk/clerk-react";

export default function ClerkLogin() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignIn 
        routing="path" 
        path="/clerk-login"
        fallbackRedirectUrl="/"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
