import { SignIn as ClerkSignIn } from "@clerk/clerk-react";

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <ClerkSignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-border shadow-lg",
          }
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
