import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { ContactDetailModal } from "@/components/contact-detail-modal";
import { useToast } from "@/hooks/use-toast";
import type { SearchResult, Contact } from "@shared/schema";
import { Network, Search, TrendingUp, Users, LogOut, Mail, Upload, Sparkles, Eye, Zap, Download } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedContact, setSelectedContact] = useState<(Contact & { connectorName?: string; matchType?: string }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  
  const handleImportNetwork = () => {
    setLocation("/onboard");
  };

  const { data: contactsData, refetch: refetchContacts } = useQuery({
    queryKey: ["/api/contacts", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/contacts?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
  });

  const enrichMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/contacts/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) throw new Error("Enrichment failed");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Enriched ${data.enriched} contacts with AI analysis`,
      });
      refetchContacts();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to enrich contacts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [searchProgress, setSearchProgress] = useState(0);

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: ["/api/search", activeSearch, user?.id],
    queryFn: async () => {
      setSearchProgress(0);
      const response = await fetch(`/api/search?q=${encodeURIComponent(activeSearch)}&userId=${user?.id}`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setSearchProgress(100);
      return data;
    },
    enabled: activeSearch.length > 0 && !!user,
  });

  useEffect(() => {
    if (!isLoading) {
      setSearchProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setSearchProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 20;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleDownloadCode = async () => {
    try {
      const response = await fetch("/api/download-project");
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "confluence-project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Project downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download project",
        variant: "destructive",
      });
    }
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
    <div className="h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
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
            <Link href="/network">
              <Button variant="ghost" size="sm" data-testid="button-network-viz">
                <Eye className="mr-2 h-4 w-4" />
                Visualize
              </Button>
            </Link>
            <Button variant="default" size="sm" onClick={handleImportNetwork} data-testid="button-import-network">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Link href="/intros">
              <Button variant="ghost" size="icon" data-testid="button-intros">
                <Mail className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleDownloadCode} title="Download project as ZIP" data-testid="button-download">
              <Download className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 py-8 md:px-6">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="mb-2 font-heading text-3xl font-semibold">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">Search your network to find warm introduction opportunities</p>
        </motion.div>

        {!activeSearch && (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Button
                onClick={() => enrichMutation.mutate()}
                disabled={enrichMutation.isPending}
                variant="outline"
                size="sm"
                data-testid="button-enrich-all"
              >
                <Zap className="mr-2 h-4 w-4" />
                {enrichMutation.isPending ? "Enriching..." : "Enrich All Contacts"}
              </Button>
            </motion.div>

            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="grid gap-4 md:grid-cols-3"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Card className="hover-elevate relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                    <CardTitle className="text-sm font-medium">Your Network</CardTitle>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <motion.div 
                      className="text-2xl font-bold" 
                      data-testid="text-contacts-count"
                      key={contactsData?.contacts?.length}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      {contactsData?.contacts?.length || 0}
                    </motion.div>
                    <p className="text-xs text-muted-foreground">Total contacts</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Card className="hover-elevate relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                    <CardTitle className="text-sm font-medium">Intro Requests</CardTitle>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Active requests</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Card className="hover-elevate relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <motion.div
                      animate={{ rotate: [-10, 10, -10] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">Completed intros</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            <Card className="border-2 border-dashed hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Import Your LinkedIn Network</CardTitle>
                    <CardDescription className="mt-1">
                      Upload your LinkedIn contacts CSV and let AI enrich them with detailed information
                    </CardDescription>
                  </div>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Our AI will automatically extract company, industry, role, and seniority from your contacts.
                  </p>
                  <Button onClick={handleImportNetwork} className="w-full" data-testid="button-import-card">
                    <Upload className="mr-2 h-4 w-4" />
                    Start Importing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </div>
        )}

        {(isLoading || searchProgress > 0) && activeSearch && (
          <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Searching network</p>
                <p className="text-xs text-muted-foreground">{Math.min(Math.floor(searchProgress), 100)}%</p>
              </div>
              <Progress value={searchProgress} className="h-2" />
            </div>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            )}
          </motion.div>
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
                    <Card
                      key={contact.id}
                      className="hover-elevate cursor-pointer transition-all"
                      onClick={() => {
                        setSelectedContact({ ...contact, matchType: "direct" });
                        setIsModalOpen(true);
                      }}
                      data-testid={`card-contact-${contact.id}`}
                    >
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
                    {searchResults.indirect.map((contact) => (
                      <Card
                        key={contact.id}
                        className="hover-elevate cursor-pointer transition-all"
                        onClick={() => {
                          setSelectedContact({ ...contact, matchType: "indirect" });
                          setIsModalOpen(true);
                        }}
                        data-testid={`card-contact-indirect-${contact.id}`}
                      >
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
                          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                            Via {contact.connectorName}
                          </Badge>
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

      <ContactDetailModal contact={selectedContact} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
