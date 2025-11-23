import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { TranslationProvider } from "@/lib/translation-context";
import Landing from "@/pages/landing";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import Onboard from "@/pages/onboard";
import Dashboard from "@/pages/dashboard";
import NetworkVisualization from "@/pages/network";
import RequestIntro from "@/pages/request-intro";
import Intros from "@/pages/intros";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/signup">{() => <PublicRoute component={Signup} />}</Route>
      <Route path="/login">{() => <PublicRoute component={Login} />}</Route>
      <Route path="/onboard">{() => <ProtectedRoute component={Onboard} />}</Route>
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      {/* <Route path="/network">{() => <ProtectedRoute component={NetworkVisualization} />}</Route> */}
      {/* <Route path="/request-intro">{() => <ProtectedRoute component={RequestIntro} />}</Route> */}
      <Route path="/intros">{() => <ProtectedRoute component={Intros} />}</Route>
      {/* <Route path="/admin">{() => <ProtectedRoute component={Admin} />}</Route> */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TranslationProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
