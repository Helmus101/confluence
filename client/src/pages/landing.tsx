import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Network, Sparkles, Shield, TrendingUp } from "lucide-react";
import heroImage from "@assets/generated_images/Professional_network_connection_illustration_ada97d74.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-semibold">Confluence</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" data-testid="button-login">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button data-testid="button-signup-header">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ height: "70vh" }}>
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Professional network visualization"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        <div className="container relative flex h-full flex-col items-center justify-center px-4 text-center md:px-6">
          <Badge className="mb-4 bg-primary/20 text-primary-foreground backdrop-blur-sm" data-testid="badge-hero">
            Warm Introductions Made Simple
          </Badge>
          <h1 className="mb-6 font-heading text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Turn Your Network Into
            <br />
            Career Opportunities
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
            Connect with professionals at your dream companies through trusted introductions.
            Upload your network, find opportunities, and get warm intros from people who know you.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover-elevate" data-testid="button-signup-hero">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover-elevate"
                data-testid="button-login-hero"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container px-4 py-16 md:px-6 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-heading text-3xl font-semibold md:text-4xl">
            How Confluence Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to unlock warm introductions
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="hover-elevate">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading">Upload Your Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Import contacts from LinkedIn CSV or add them manually. We'll enrich them with
                company and role information using AI.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading">Find Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Search by company, industry, or role. See direct connections and discover indirect
                paths through other Confluence members.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading">Get Warm Intros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Request introductions through connectors. AI-powered message templates make it easy
                to reach out professionally.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-1">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="font-heading text-3xl font-bold">2,500+</div>
              </div>
              <p className="text-sm text-muted-foreground">Connections Made</p>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-1">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="font-heading text-3xl font-bold">150+</div>
              </div>
              <p className="text-sm text-muted-foreground">Universities</p>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-1">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="font-heading text-3xl font-bold">87%</div>
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-1">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="font-heading text-3xl font-bold">24hr</div>
              </div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-semibold md:text-4xl">
            Ready to Build Your Career Network?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of students and early-career professionals making meaningful connections.
          </p>
          <Link href="/signup">
            <Button size="lg" data-testid="button-signup-cta">
              Start Building Connections
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground md:px-6">
          <p>© 2024 Confluence. Warm introductions for early-career talent.</p>
        </div>
      </footer>
    </div>
  );
}
