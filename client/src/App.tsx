import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { TasksProvider } from "@/contexts/TasksContext";
import { ClientsProvider } from "@/contexts/ClientsContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Clients from "@/pages/Clients";
import ClientDetails from "@/pages/ClientDetails";
import Meetings from "@/pages/Meetings";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import SSOCallback from "@/pages/SSOCallback";
import ForgotPassword from "@/pages/ForgotPassword";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import ClerkLogin from "@/pages/ClerkLogin";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/clients/:id" component={ClientDetails} />
      <Route path="/meetings" component={Meetings} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/admin" component={Admin} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PublicRouter() {
  return (
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
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function AuthenticatedApp() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ClientsProvider>
      <TasksProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-3 border-b border-border">
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
  );
}

// TEMPORARY: Set to true to bypass authentication during development
const DEV_BYPASS_AUTH = true;

export default function App() {
  const { isLoaded } = useAuth();

  // Skip auth loading check in dev bypass mode
  if (!DEV_BYPASS_AUTH && !isLoaded) {
    return <LoadingScreen />;
  }

  return (
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
  );
}
