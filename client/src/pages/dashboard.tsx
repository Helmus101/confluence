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
import { NotificationCenter } from "@/components/notification-center";
import { useToast } from "@/hooks/use-toast";
import type { SearchResult, Contact } from "@shared/schema";
import { Network, Search, TrendingUp, Users, LogOut, Mail, Upload, Sparkles, Eye, Zap, MessageSquare } from "lucide-react";
import { useTranslation } from "@/lib/translation-context";

export default function Dashboard() {
  const { t, language, setLanguage } = useTranslation();
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

  useEffect(() => {
    document.title = t("welcome-back");
  }, [t]);

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

  const handleAskForIntro = (contact: any) => {
    setSelectedContact({ ...contact, matchType: "indirect" });
    setIsModalOpen(true);
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
      <header className="sticky top-0 z-50 w-full border-b/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 shadow-sm">
        <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 cursor-pointer">
              <Network className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-semibold">Confluence</span>
            </div>
          </Link>
          <div className="flex items-center gap-1 ml-4">
            {contactsData?.contacts && contactsData.contacts.length > 0 && (
              <Button 
                variant={contactsData.contacts.some((c: any) => !c.enriched) ? "outline" : "ghost"}
                size="sm" 
                onClick={() => enrichMutation.mutate()}
                disabled={enrichMutation.isPending || !contactsData.contacts.some((c: any) => !c.enriched)}
                data-testid="button-enrich-status"
                className={contactsData.contacts.some((c: any) => !c.enriched) ? "border-amber-500/50 text-amber-700 dark:text-amber-400" : ""}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="text-xs">{contactsData.contacts.filter((c: any) => c.enriched).length}/{contactsData.contacts.length} enriched</span>
              </Button>
            )}
            <Link href="/intros">
              <Button variant="ghost" size="icon" data-testid="button-intros" className="hover-elevate">
                <Mail className="h-5 w-5" />
              </Button>
            </Link>
            <NotificationCenter userId={user?.id} />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                const newLang = language === 'fr' ? 'en' : 'fr';
                localStorage.setItem("language", newLang);
                window.location.reload();
              }}
              data-testid="button-language-toggle"
              className="hover-elevate text-sm"
            >
              {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout" className="hover-elevate">
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
            {t("search-greeting", { name: user?.name?.split(" ")[0] || "" })}
          </h1>
          <p className="text-muted-foreground">{t("search-desc")}</p>
        </motion.div>

        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <form onSubmit={handleSearch} className="w-full">
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
        </motion.div>

        {!activeSearch && contactsData?.contacts && contactsData.contacts.length > 0 && (
          <motion.div
            className="grid gap-4 md:grid-cols-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("your-network")}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-contacts-count">
                    {contactsData?.contacts?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("total-contacts")}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("introduction-requests")}</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">{t("active-requests")}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
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
            </motion.div>
          </motion.div>
        )}

        {!activeSearch && contactsData?.contacts && contactsData.contacts.length > 0 && (
          <div className="mb-6">
            <Button
              onClick={() => enrichMutation.mutate()}
              disabled={enrichMutation.isPending || !contactsData.contacts.some((c: any) => !c.enriched)}
              variant={contactsData.contacts.some((c: any) => !c.enriched) ? "default" : "ghost"}
              size="sm"
              data-testid="button-enrich-all"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {enrichMutation.isPending ? "Enriching..." : "Enrich Contacts"}
            </Button>
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
                  <h2 className="font-heading text-2xl font-semibold">{t("direct-matches")}</h2>
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
                    <h2 className="font-heading text-2xl font-semibold">{t("indirect-opportunities")}</h2>
                    <Badge variant="secondary">{searchResults.indirect.length}</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {searchResults.indirect.map((contact) => (
                      <Card
                        key={contact.id}
                        className="hover-elevate transition-all"
                        data-testid={`card-contact-indirect-${contact.id}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => {
                              setSelectedContact({ ...contact, matchType: "indirect", connectorId: (contact as any).connectorId });
                              setIsModalOpen(true);
                            }}>
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
                          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 mb-4">
                            Via {contact.connectorName}
                          </Badge>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAskForIntro(contact)}
                            className="w-full"
                            data-testid={`button-ask-intro-${contact.id}`}
                          >
                            <MessageSquare className="mr-1 h-4 w-4" />
                            {t("ask-intro")}
                          </Button>
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
                  <h3 className="mb-2 font-heading text-lg font-medium">{t("no-matches")}</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    {t("no-matches-desc")}
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
