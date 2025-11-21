import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Contact } from "@shared/schema";

interface ContactDetailModalProps {
  contact: (Contact & { connectorName?: string; matchType?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactDetailModal({ contact, isOpen, onClose }: ContactDetailModalProps) {
  const [copied, setCopied] = useState(false);

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

          {contact.matchType === "indirect" && contact.connectorName && (
            <>
              <Separator />
              <div className="rounded-lg bg-blue-500/10 p-3">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Available via <span className="font-semibold">{contact.connectorName}</span> in your network
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-close-modal">
            Close
          </Button>
          {contact.linkedinUrl && (
            <Button asChild className="flex-1" data-testid="button-view-profile">
              <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                View Profile
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
