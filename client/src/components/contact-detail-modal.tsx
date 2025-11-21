import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Copy, Check, Send } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { t } from "@/lib/translation";
import type { Contact } from "@shared/schema";

interface ContactDetailModalProps {
  contact: (Contact & { connectorName?: string; matchType?: string; connectorId?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactDetailModal({ contact, isOpen, onClose }: ContactDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [showIntroForm, setShowIntroForm] = useState(false);
  const [message, setMessage] = useState("");
  const [essay, setEssay] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!contact || !user || !contact.connectorId) throw new Error("Missing required data");
      const wordCount = essay.trim().split(/\s+/).length;
      if (wordCount < 100) throw new Error(t("minimum-words"));

      const response = await fetch("/api/intro/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          connectorUserId: contact.connectorId,
          contactId: contact.id,
          targetCompany: contact.company || "Unknown",
          reason: message,
          userEssay: essay,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intro/sent"] });
      toast({
        title: "Success",
        description: "Introduction request sent!",
      });
      setShowIntroForm(false);
      setMessage("");
      setEssay("");
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      });
    },
  });

  if (!contact) return null;

  const handleCopyLinkedIn = () => {
    if (contact.linkedinUrl) {
      navigator.clipboard.writeText(contact.linkedinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const initializeIntroForm = () => {
    if (contact?.connectorName && contact?.name) {
      const prefilledMessage = t("prefilled-message", {
        name: contact.name,
        connector: contact.connectorName,
      });
      setMessage(prefilledMessage);
      setShowIntroForm(true);
    }
  };

  const wordCount = essay.trim().split(/\s+/).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{getInitials(contact.name || "?")}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{contact.name}</DialogTitle>
              <DialogDescription>{contact.title} {contact.company && `at ${contact.company}`}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            {contact.title && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Title</p>
                <p className="mt-1 text-sm">{contact.title}</p>
              </div>
            )}
            {contact.company && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Company</p>
                <p className="mt-1 text-sm">{contact.company}</p>
              </div>
            )}
            {contact.industry && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Industry</p>
                <p className="mt-1 text-sm">{contact.industry}</p>
              </div>
            )}
            {contact.seniority && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Seniority</p>
                <p className="mt-1 text-sm capitalize">{contact.seniority}</p>
              </div>
            )}
            {contact.location && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Location</p>
                <p className="mt-1 text-sm">{contact.location}</p>
              </div>
            )}
            {contact.confidence && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Confidence</p>
                <p className="mt-1 text-sm">{contact.confidence}%</p>
              </div>
            )}
          </div>

          <Separator />

          {/* AI Summary */}
          {contact.linkedinSummary && (
            <div>
              <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase">AI Summary</p>
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed">{contact.linkedinSummary}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* LinkedIn URL */}
          {contact.linkedinUrl && (
            <div>
              <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase">LinkedIn Profile</p>
              <div className="flex items-center gap-2">
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-sm text-primary hover:underline"
                  data-testid="link-linkedin"
                >
                  {contact.linkedinUrl}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLinkedIn}
                  data-testid="button-copy-linkedin"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid="button-open-linkedin"
                >
                  <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    Open
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Additional Fields */}
          {(contact.email || contact.phone) && (
            <>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {contact.email && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Email</p>
                    <a href={`mailto:${contact.email}`} className="mt-1 text-sm text-primary hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Phone</p>
                    <a href={`tel:${contact.phone}`} className="mt-1 text-sm text-primary hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {contact.matchType === "indirect" && contact.connectorName && !showIntroForm && (
            <>
              <Separator />
              <div className="rounded-lg bg-blue-500/10 p-3">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {t("via")} <span className="font-semibold">{contact.connectorName}</span> in your network
                </p>
              </div>
            </>
          )}

          {showIntroForm && contact.matchType === "indirect" && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">{t("edit-message")}</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-20"
                    data-testid="textarea-message"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">{t("essay-label")}</label>
                  <Textarea
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    placeholder={t("essay-placeholder")}
                    className="min-h-32"
                    data-testid="textarea-essay"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("word-count", { count: wordCount.toString() })}
                    {wordCount < 100 && <span className="text-destructive"> - {t("minimum-words")}</span>}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {showIntroForm ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowIntroForm(false)}
                className="flex-1"
                data-testid="button-cancel-intro"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={() => requestMutation.mutate()}
                disabled={requestMutation.isPending || wordCount < 100}
                className="flex-1"
                data-testid="button-send-intro"
              >
                <Send className="mr-2 h-4 w-4" />
                {t("send-request")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-close-modal">
                {t("close")}
              </Button>
              {contact.matchType === "indirect" && contact.connectorId && (
                <Button
                  onClick={initializeIntroForm}
                  className="flex-1"
                  data-testid="button-request-intro-modal"
                >
                  {t("ask-intro")}
                </Button>
              )}
              {contact.linkedinUrl && (
                <Button asChild className="flex-1" data-testid="button-view-profile">
                  <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    {t("view-profile")}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
