import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { queryClient } from "@/lib/queryClient";
import { t } from "@/lib/translation";
import type { IntroRequest } from "@shared/schema";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Mail, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useTranslation } from "@/lib/translation-context";

export default function Intros() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: sentRequests, isLoading: loadingSent } = useQuery<IntroRequest[]>({
    queryKey: ["/api/intro/sent", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/intro/sent?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: receivedRequests, isLoading: loadingReceived } = useQuery<IntroRequest[]>({
    queryKey: ["/api/intro/received", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/intro/received?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
    enabled: !!user,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: "accept" | "decline" }) => {
      const response = await fetch("/api/intro/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action, userId: user?.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Action failed");
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/intro/received"] });
      toast({
        title: variables.action === "accept" ? "Request accepted!" : "Request declined",
        description:
          variables.action === "accept"
            ? "You can now reach out to make the introduction."
            : "The requester has been notified.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch("/api/intro/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, userId: user?.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Action failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intro/sent"] });
      toast({ title: "Introduction marked as complete!", description: "Great work connecting people!" });
    },
    onError: (error: Error) => {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Accepted
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400">
            <XCircle className="mr-1 h-3 w-3" />
            Declined
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-semibold">Introduction Requests</h1>
          <p className="text-muted-foreground">Manage your intro requests and help others connect</p>
        </div>

        <Tabs defaultValue="sent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sent" data-testid="tab-sent">
              <Mail className="mr-2 h-4 w-4" />
              {t("requests-sent")}
            </TabsTrigger>
            <TabsTrigger value="received" data-testid="tab-received">
              <Mail className="mr-2 h-4 w-4" />
              {t("requests-received")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="mt-6">
            {loadingSent ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : sentRequests && sentRequests.length > 0 ? (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <Card key={request.id} data-testid={`card-sent-${request.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base">Intro to {(request as any).contactName || request.targetCompany}</CardTitle>
                          <CardDescription>
                            Requested {format(new Date(request.createdAt), "MMM d, yyyy")}
                          </CardDescription>
                          {(request as any).askerLinkedin && (
                            <a href={(request as any).askerLinkedin} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
                              LinkedIn Profile <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="mb-1 text-sm font-medium">Your message:</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>
                      {request.status === "accepted" && (
                        <div className="rounded-md border border-green-500/20 bg-green-500/5 p-3">
                          <p className="text-sm text-green-700 dark:text-green-400">
                            {t("connector-accepted")}
                          </p>
                        </div>
                      )}
                      {request.status === "declined" && (
                        <div className="rounded-md border border-red-500/20 bg-red-500/5 p-3">
                          <p className="text-sm text-red-700 dark:text-red-400">
                            {t("declined-intro")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-heading text-lg font-medium">{t("no-requests-sent")}</h3>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    {t("search-opportunities")}
                  </p>
                  <Link href="/dashboard">
                    <Button data-testid="button-go-dashboard">{t("go-dashboard")}</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            {loadingReceived ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : receivedRequests && receivedRequests.length > 0 ? (
              <div className="space-y-4">
                {receivedRequests.map((request) => (
                  <Card key={request.id} data-testid={`card-received-${request.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base">Intro request to {(request as any).contactName || request.targetCompany}</CardTitle>
                          <CardDescription className="space-y-1">
                            <div>Received {format(new Date(request.createdAt), "MMM d, yyyy")}</div>
                            {(request as any).requesterEmail && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">Requester: </span>
                                <a href={`mailto:${(request as any).requesterEmail}`} className="font-mono text-primary hover:underline">
                                  {(request as any).requesterEmail}
                                </a>
                              </div>
                            )}
                          </CardDescription>
                          <div className="mt-2 flex gap-2">
                            {(request as any).contactLinkedin && (
                              <a href={(request as any).contactLinkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                                Contact LinkedIn <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {(request as any).askerLinkedin && (
                              <a href={(request as any).askerLinkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                                Requester LinkedIn <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="mb-1 text-sm font-medium">Their message:</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>
                      {(request as any).userEssay && (
                        <div>
                          <p className="mb-1 text-sm font-medium">About the requester:</p>
                          <p className="text-sm text-muted-foreground">{(request as any).userEssay}</p>
                        </div>
                      )}
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => respondMutation.mutate({ requestId: request.id, action: "accept" })}
                            disabled={respondMutation.isPending}
                            className="flex-1"
                            data-testid={`button-accept-${request.id}`}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {t("accept")}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => respondMutation.mutate({ requestId: request.id, action: "decline" })}
                            disabled={respondMutation.isPending}
                            className="flex-1"
                            data-testid={`button-decline-${request.id}`}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {t("decline")}
                          </Button>
                        </div>
                      )}
                      {request.status === "accepted" && (
                        <div className="space-y-3">
                          <div className="rounded-md border border-green-500/20 bg-green-500/5 p-3">
                            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                              ✓ You've accepted this request. You can now reach out to the requester or contact person to make the intro.
                            </p>
                          </div>
                          <Button
                            onClick={() => completeMutation.mutate(request.id)}
                            disabled={completeMutation.isPending}
                            className="w-full"
                            data-testid={`button-complete-${request.id}`}
                          >
                            Mark as Complete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-heading text-lg font-medium">No requests received yet</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    When others request intros through your network, they'll appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
