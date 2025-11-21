import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Network, LogOut, ArrowLeft, BarChart3, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Contact } from "@shared/schema";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function NetworkVisualization() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: contactsData, isLoading } = useQuery({
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

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto w-full max-w-7xl flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-24" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  const contacts: Contact[] = contactsData?.contacts || [];
  if (contacts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="mx-auto w-full max-w-7xl flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No contacts yet</h2>
          <p className="text-muted-foreground mb-6">Import your LinkedIn network to visualize your connections</p>
          <Link href="/onboard">
            <Button>Import Network</Button>
          </Link>
        </main>
      </div>
    );
  }
  
  // Prepare data for visualizations (only from enriched contacts)
  const enrichedContacts = contacts.filter((c) => c.enriched);
  
  const companyData = enrichedContacts.reduce((acc: Record<string, number>, contact) => {
    if (contact.company) {
      acc[contact.company] = (acc[contact.company] || 0) + 1;
    }
    return acc;
  }, {});

  const companyChartData = Object.entries(companyData)
    .map(([company, count]) => ({ name: company.substring(0, 20), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const industryData = enrichedContacts.reduce((acc: Record<string, number>, contact) => {
    if (contact.industry) {
      acc[contact.industry] = (acc[contact.industry] || 0) + 1;
    }
    return acc;
  }, {});

  const industryChartData = Object.entries(industryData)
    .map(([industry, count]) => ({ name: industry, value: count }))
    .sort((a, b) => b.value - a.value);

  const seniorityData = enrichedContacts.reduce((acc: Record<string, number>, contact) => {
    if (contact.seniority) {
      acc[contact.seniority] = (acc[contact.seniority] || 0) + 1;
    }
    return acc;
  }, {});

  const seniorityChartData = Object.entries(seniorityData)
    .map(([seniority, count]) => ({ name: seniority, count }))
    .sort((a, b) => b.count - a.count);

  const enrichmentRate = contacts.length > 0 ? Math.round((enrichedContacts.length / contacts.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-7xl flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="font-heading text-4xl font-bold">Your Network Map</h1>
          </div>
          <p className="text-muted-foreground">Visualize and understand your professional connections</p>
        </motion.div>

        <div className="grid gap-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Total Contacts", value: contacts.length },
              { label: "Enriched", value: `${enrichedContacts.length}` },
              { label: "Industries", value: Object.keys(industryData).length },
              { label: "Companies", value: Object.keys(companyData).length },
            ].map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Company Distribution */}
            {companyChartData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle>Top Companies</CardTitle>
                    <CardDescription>Your network distribution by company</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={companyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Industry Distribution */}
            {industryChartData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle>Industry Breakdown</CardTitle>
                    <CardDescription>Your contacts across industries</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={industryChartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                          {industryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seniority Distribution */}
            {seniorityChartData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle>Seniority Distribution</CardTitle>
                    <CardDescription>Experience levels in your network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={seniorityChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Enrichment Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle>Enrichment Status</CardTitle>
                <CardDescription>AI analysis of your contacts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{enrichmentRate}% Complete</span>
                  <span className="text-xs text-muted-foreground">{enrichedContacts.length} of {contacts.length}</span>
                </div>
                <div className="w-full bg-muted rounded-lg overflow-hidden h-3">
                  <motion.div className="h-full bg-gradient-to-r from-primary to-primary/60" initial={{ width: 0 }} animate={{ width: `${enrichmentRate}%` }} transition={{ duration: 1.5, ease: "easeOut" }} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {enrichmentRate === 100 ? "All set! Your network is fully analyzed and ready to search." : enrichmentRate >= 50 ? "Great progress! Most contacts are enriched." : "Enrich more contacts to improve search results."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
