import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SearchResult, Contact } from "@shared/schema";
import { Network, Search, TrendingUp, Users, LogOut, Mail } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: ["/api/search", activeSearch, user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(activeSearch)}&userId=${user?.id}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: activeSearch.length > 0 && !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">High</Badge>;
    if (confidence >= 50) return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Medium</Badge>;
    return <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400">Low</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/dashboard">
            <a className="flex items-center gap-2">
              <Network className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-semibold">Confluence</span>
            </a>
          </Link>
          <div className="flex flex-1 items-center justify-center">
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search with AI — 'fintech interns in NYC', 'product managers at Google', etc."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/intros">
              <Button variant="ghost" size="icon" data-testid="button-intros">
                <Mail className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-semibold">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">Search your network to find warm introduction opportunities</p>
        </div>

        {!activeSearch && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Network</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Total contacts</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Intro Requests</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Active requests</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Completed intros</p>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading && activeSearch && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {searchResults && activeSearch && (
          <div className="space-y-8">
            {searchResults.direct && searchResults.direct.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="font-heading text-2xl font-semibold">Direct Matches</h2>
                  <Badge variant="secondary">{searchResults.direct.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {searchResults.direct.map((contact) => (
                    <Card key={contact.id} className="hover-elevate" data-testid={`card-contact-${contact.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(contact.name || "?")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{contact.name}</CardTitle>
                              <CardDescription>
                                {contact.title} {contact.company && `at ${contact.company}`}
                              </CardDescription>
                            </div>
                          </div>
                          {contact.confidence && getConfidenceBadge(contact.confidence)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2">
                          {contact.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {contact.industry}
                            </Badge>
                          )}
                          {contact.seniority && (
                            <Badge variant="secondary" className="text-xs">
                              {contact.seniority}
                            </Badge>
                          )}
                          {contact.location && (
                            <Badge variant="secondary" className="text-xs">
                              {contact.location}
                            </Badge>
                          )}
                        </div>
                        <Badge className="bg-primary/10 text-primary">Direct Contact</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchResults.indirect && searchResults.indirect.length > 0 && (
              <>
                {searchResults.direct && searchResults.direct.length > 0 && <Separator className="my-8" />}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <h2 className="font-heading text-2xl font-semibold">Indirect Opportunities</h2>
                    <Badge variant="secondary">{searchResults.indirect.length}</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {searchResults.indirect.map((match, idx) => (
                      <Card key={idx} className="hover-elevate" data-testid={`card-indirect-${idx}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <CardTitle className="text-base">{match.company}</CardTitle>
                              <CardDescription>
                                Available via {match.connectorName}
                              </CardDescription>
                            </div>
                            {getConfidenceBadge(match.confidence)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            We've found a possible intro path to {match.company} via a verified Confluence member.
                            To protect privacy, we will only reveal the connector's contact if they accept your
                            request.
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              Connector score: {match.connectorStats.successCount} successful •{" "}
                              {match.connectorStats.responseRate}% response rate
                            </div>
                          </div>
                          <Link href={`/request-intro?connector=${match.connectorId}&company=${match.company}`}>
                            <Button className="w-full" data-testid={`button-request-intro-${idx}`}>
                              Request Introduction
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {searchResults.direct.length === 0 && searchResults.indirect.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-heading text-lg font-medium">No matches found</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    Try a different search term or add more contacts to expand your network
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
