import { Switch, Route } from "wouter";
import { useLocation } from "wouter";
import React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { AuthPage } from "@/components/auth/auth-page";
import { AuthCallback } from "@/components/auth/auth-callback";
import Landing from "@/pages/landing";
import { TourProvider } from "@/components/onboarding/tour-context";
import { TourModal } from "@/components/onboarding/tour-modal";
import { HelpButton } from "@/components/onboarding/help-button";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import Agents from "@/pages/agents";
import Workflow from "@/pages/workflow";
import Conductor from "@/pages/conductor";
import Pricing from "@/pages/pricing";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orchestra-brown border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 mt-4">Loading Orchestra...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the protected app
  if (user) {
    return (
      <TourProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Switch>
            <Route path="/" component={() => {
              const [, setLocation] = useLocation();
              React.useEffect(() => {
                setLocation("/dashboard");
              }, [setLocation]);
              return null;
            }} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/agents" component={Agents} />
            <Route path="/workflow" component={Workflow} />
            <Route path="/conductor" component={Conductor} />
            <Route path="/pricing" component={Pricing} />
            <Route component={NotFound} />
          </Switch>
          <TourModal />
          <HelpButton />
        </div>
      </TourProvider>
    );
  }

  // If user is not authenticated, show public routes
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={AuthPage} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route component={Landing} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
