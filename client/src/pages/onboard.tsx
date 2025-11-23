import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { Upload, UserPlus, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/translation-context";

export default function Onboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"upload" | "review" | "enrich" | "complete">("upload");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      rawText: "",
      name: undefined,
      company: undefined,
      title: undefined,
      linkedinUrl: undefined,
    },
  });

  const uploadCsvMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user?.id || "");
      const response = await fetch("/api/contacts/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedCount(data.count);
      setStep("review");
      toast({ title: "Contacts uploaded!", description: `${data.count} contacts ready for enrichment.` });
    },
    onError: (error: Error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await fetch("/api/contacts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: user?.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add contact");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Contact added!", description: "Your contact has been added successfully." });
      form.reset();
      setUploadedCount((prev) => prev + 1);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add contact", description: error.message, variant: "destructive" });
    },
  });

  const enrichMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/contacts/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Enrichment failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setEnrichmentProgress(100);
      setTimeout(() => {
        setStep("complete");
        queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
        toast({ title: "Enrichment complete!", description: `${data.enriched} contacts enriched with AI.` });
      }, 500);
    },
    onError: (error: Error) => {
      setEnrichmentProgress(0);
      toast({ title: "Enrichment failed", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!enrichMutation.isPending) {
      setEnrichmentProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setEnrichmentProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [enrichMutation.isPending]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleUploadCsv = () => {
    if (csvFile) {
      uploadCsvMutation.mutate(csvFile);
    }
  };

  const handleEnrich = () => {
    setStep("enrich");
    enrichMutation.mutate();
  };

  const handleComplete = () => {
    setLocation("/dashboard");
  };

  const progressValue = {
    upload: 25,
    review: 50,
    enrich: 75,
    complete: 100,
  }[step];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-semibold">Welcome to Confluence</h1>
          <p className="text-muted-foreground">Let's get your network set up in a few simple steps</p>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{step === "complete" ? "Complete" : "In progress"}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Upload</span>
            <span>Review</span>
            <span>Enrich</span>
            <span>Complete</span>
          </div>
        </div>

        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Contacts</CardTitle>
              <CardDescription>
                Export your LinkedIn connections as a CSV file and upload it here. We'll automatically enrich them with AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex h-64 flex-col items-center justify-center rounded-md border-2 border-dashed p-6 hover:bg-accent/50 transition">
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium">
                  {csvFile ? csvFile.name : "Drop your CSV file here, or click to browse"}
                </p>
                <p className="mb-4 text-xs text-muted-foreground">CSV files only</p>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="max-w-xs"
                  data-testid="input-csv-file"
                />
              </div>
              <Button
                onClick={handleUploadCsv}
                disabled={!csvFile || uploadCsvMutation.isPending}
                className="w-full"
                data-testid="button-upload-csv"
              >
                {uploadCsvMutation.isPending ? "Uploading..." : "Upload & Continue"}
              </Button>
              {/* Manual entry preserved for future use
            <Tabs defaultValue="csv" className="w-full">
            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle>Add Contact Manually</CardTitle>
                  <CardDescription>Add contacts one at a time with their details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => addContactMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" data-testid="input-contact-name" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Google" data-testid="input-contact-company" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Software Engineer" data-testid="input-contact-title" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedinUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn URL (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://linkedin.com/in/johndoe"
                                data-testid="input-contact-linkedin"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rawText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Raw Text (if you have unstructured data)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Jane Smith, Microsoft, Product Manager..."
                                data-testid="input-contact-raw"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={addContactMutation.isPending} className="w-full" data-testid="button-add-contact">
                        {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                      </Button>
                    </form>
                  </Form>
                  {uploadedCount > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        {uploadedCount} contact{uploadedCount === 1 ? "" : "s"} added
                      </p>
                      <Button onClick={() => setStep("review")} className="mt-2 w-full" data-testid="button-continue-review">
                        Continue to Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Tabs>
            */}
            </CardContent>
          </Card>
        )}

        {step === "review" && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Contacts</CardTitle>
              <CardDescription>
                You've added {uploadedCount} contact{uploadedCount === 1 ? "" : "s"}. Ready to enrich them with AI?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <p className="mb-2 text-sm font-medium">What happens next:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    AI will extract company, title, industry, and seniority information
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    Contacts will be organized and ready to search
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    You'll be able to find both direct and indirect intro opportunities
                  </li>
                </ul>
              </div>
              <Button onClick={handleEnrich} className="w-full" data-testid="button-enrich">
                Enrich Contacts with AI
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "enrich" && (
          <Card>
            <CardHeader>
              <CardTitle>Enriching Your Contacts</CardTitle>
              <CardDescription>Please wait while we process your contacts with AI...</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="mb-6 h-16 w-16 animate-pulse text-primary" />
              <div className="w-full max-w-xs space-y-3">
                <Progress value={enrichmentProgress} className="h-2" data-testid="progress-enrichment" />
                <p className="text-center text-sm font-medium text-muted-foreground">
                  {Math.round(enrichmentProgress)}% — Processing {uploadedCount} contact{uploadedCount === 1 ? "" : "s"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "complete" && (
          <Card>
            <CardHeader>
              <CardTitle>All Set!</CardTitle>
              <CardDescription>Your network is ready. Let's find some opportunities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <p className="mb-2 text-lg font-medium">Enrichment Complete!</p>
                <p className="text-center text-sm text-muted-foreground">
                  Your contacts have been processed and are ready to help you find warm introductions.
                </p>
              </div>
              <Button onClick={handleComplete} className="w-full" data-testid="button-go-dashboard">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
