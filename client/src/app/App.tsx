import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "@/shared/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@app/components/AppSidebar";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { useSupabaseAuth } from "@/shared/hooks/useSupabaseAuth";
import { TasksProvider, Tasks } from "@features/tasks";
import { ClientsProvider } from "@features/clients";
import NotFound from "@app/pages/NotFound";
import Dashboard from "@app/pages/Dashboard";
import Clients from "@features/clients/pages/Clients";
import ClientDetails from "@features/clients/pages/ClientDetails";
// Feature imports
import { SignIn, SignUp, SSOCallback, ForgotPassword, ClerkLogin } from "@features/auth";
import { UsersProvider, useCurrentUser, Admin, Profile } from "@features/users";
import { StyleGuides } from "@features/style-guides";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

function AuthenticatedRouter() {
  return (
    <ErrorBoundary level="page">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/clients/:id" component={ClientDetails} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/admin" component={Admin} />
        <Route path="/profile" component={Profile} />
        <Route path="/style-guides" component={StyleGuides} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function PublicRouter() {
  return (
    <ErrorBoundary level="page">
      <Switch>
        <Route path="/sign-in" component={SignIn} />
        <Route path="/sign-up" component={SignUp} />
        <Route path="/sso-callback" component={SSOCallback} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/clerk-login" component={ClerkLogin} />
        <Route>
          <Redirect to="/sign-in" />
        </Route>
      </Switch>
    </ErrorBoundary>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function AuthenticatedApp() {
  // Sincroniza token do Clerk com Supabase para acesso direto ao banco
  const { isReady: isSupabaseReady } = useSupabaseAuth();
  // Sincroniza o usuário do Clerk com o banco de dados
  const { isLoading: isSyncingUser } = useCurrentUser();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Mostra loading enquanto sincroniza o usuário e o Supabase
  if (isSyncingUser || !isSupabaseReady) {
    return <LoadingScreen />;
  }

  return (
    <UsersProvider>
      <ClientsProvider>
        <TasksProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex items-center justify-between border-b border-border p-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => window.history.back()}
                      data-testid="button-nav-back"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => window.history.forward()}
                      data-testid="button-nav-forward"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <AuthenticatedRouter />
                </main>
              </div>
            </div>
          </SidebarProvider>
        </TasksProvider>
      </ClientsProvider>
    </UsersProvider>
  );
}

// TEMPORARY: Set to true to bypass authentication during development
const DEV_BYPASS_AUTH = false;

export default function App() {
  const { isLoaded } = useAuth();

  // Skip auth loading check in dev bypass mode
  if (!DEV_BYPASS_AUTH && !isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary level="page">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {DEV_BYPASS_AUTH ? (
            <AuthenticatedApp />
          ) : (
            <>
              <SignedIn>
                <AuthenticatedApp />
              </SignedIn>
              <SignedOut>
                <PublicRouter />
              </SignedOut>
            </>
          )}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
