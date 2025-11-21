import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { insertIntroRequestSchema, type InsertIntroRequest } from "@shared/schema";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/translation-context";

export default function RequestIntro() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const connectorId = params.get("connector") || "";
  const company = params.get("company") || "";

  const form = useForm<InsertIntroRequest>({
    resolver: zodResolver(insertIntroRequestSchema.extend({
      reason: insertIntroRequestSchema.shape.reason.min(20, "Please provide at least 20 characters"),
    })),
    defaultValues: {
      connectorUserId: connectorId,
      targetCompany: company,
      reason: "",
      contactId: undefined,
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: InsertIntroRequest) => {
      const response = await fetch("/api/intro/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: user?.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Introduction request sent!",
        description: "The connector will be notified and can accept or decline your request.",
      });
      setLocation("/intros");
    },
    onError: (error: Error) => {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-semibold">Request Introduction</h1>
          <p className="text-muted-foreground">Explain why you're interested in connecting with {company}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Introduction Details</CardTitle>
            <CardDescription>
              This message will be sent to the connector who will review your request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => requestMutation.mutate(data))}
                className="space-y-6"
              >
                <div className="rounded-md bg-muted/50 p-4">
                  <p className="mb-1 text-sm font-medium">Requesting intro to:</p>
                  <p className="text-lg font-semibold">{company}</p>
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why are you interested?</FormLabel>
                      <FormDescription>
                        Explain your background, why you're interested in {company}, and what you hope to learn or
                        achieve through this connection.
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder={`I'm currently studying Computer Science at Stanford and am very interested in ${company}'s work in... I would love to learn more about...`}
                          rows={8}
                          data-testid="textarea-reason"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-md border p-4">
                  <p className="mb-2 text-sm font-medium">What happens next:</p>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                    <li>The connector will receive your request with your message</li>
                    <li>They can choose to accept or decline based on their relationship with their contact</li>
                    <li>If accepted, we'll provide AI-generated message templates to help facilitate the intro</li>
                    <li>You'll be notified when the connector makes their decision</li>
                  </ol>
                </div>

                <Button
                  type="submit"
                  disabled={requestMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-request"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {requestMutation.isPending ? "Sending Request..." : "Send Introduction Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
