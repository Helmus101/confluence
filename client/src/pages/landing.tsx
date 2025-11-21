import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Network, Zap, Brain, Users, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-20, 20, -20],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const scaleVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const slideInVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-7xl flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <motion.div 
            className="flex items-center gap-2 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Network className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="font-heading text-lg sm:text-xl font-semibold">Confluence</span>
          </motion.div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden xs:inline-flex" data-testid="button-login">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" data-testid="button-signup-header">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="mx-auto w-full max-w-7xl relative px-4 sm:px-6">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-6 inline-flex gap-2" data-testid="badge-hero">
                <Zap className="h-3 w-3" />
                The intelligent way to find warm introductions
              </Badge>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="mb-6 font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold"
            >
              Turn Your Network Into
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Career Breakthroughs
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="mb-8 text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground"
            >
              Find real connections at target companies. Get introduced through people who know you. 
              AI-powered contact enrichment meets human-centered networking.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col gap-4 sm:flex-row justify-center"
            >
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="gap-2"
                  data-testid="button-signup-hero"
                >
                  Start Your Network
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  data-testid="button-login-hero"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            className="mb-12 sm:mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 font-heading text-3xl sm:text-4xl md:text-5xl font-bold">
              How Confluence Works
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground lg:text-xl">
              Three core capabilities powered by AI and human judgment
            </p>
          </motion.div>

          <motion.div 
            className="grid gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Feature 1 */}
            <motion.div variants={scaleVariants}>
              <Card className="group h-full hover-elevate relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <CardHeader className="relative">
                  <motion.div 
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Network className="h-6 w-6 text-primary" />
                  </motion.div>
                  <CardTitle className="font-heading text-xl">Import Your Network</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <p className="text-muted-foreground">
                    Upload your LinkedIn contacts CSV or add contacts manually. Confluence ingests your real network data and maintains it securely.
                  </p>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm font-medium text-primary">Built for real networks, not databases.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={scaleVariants}>
              <Card className="group h-full hover-elevate relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <CardHeader className="relative">
                  <motion.div 
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Brain className="h-6 w-6 text-primary" />
                  </motion.div>
                  <CardTitle className="font-heading text-xl">AI-Powered Enrichment</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <p className="text-muted-foreground">
                    Our AI analyzes contact information to extract company, role, industry, seniority, skills, and professional background. 18+ enriched fields per contact.
                  </p>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm font-medium text-primary">Deep insights from shallow data.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={scaleVariants}>
              <Card className="group h-full hover-elevate relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <CardHeader className="relative">
                  <motion.div 
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Users className="h-6 w-6 text-primary" />
                  </motion.div>
                  <CardTitle className="font-heading text-xl">Request Warm Intros</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <p className="text-muted-foreground">
                    Search for people by company, role, or industry. Find direct connections and paths through connectors. AI generates professional introduction templates.
                  </p>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm font-medium text-primary">Human connections, AI-assisted.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="border-t py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left side - Text */}
            <motion.div
              className="flex flex-col justify-center space-y-6"
              initial="hidden"
              whileInView="visible"
              variants={slideInVariants}
              viewport={{ once: true }}
            >
              <div>
                <h2 className="mb-4 font-heading text-4xl font-bold">
                  Why Confluence Matters
                </h2>
                <p className="text-lg text-muted-foreground">
                  Getting introduced to companies you care about is hard. Cold applications have a 2% response rate. 
                  Warm introductions have a 40-50% response rate.
                </p>
              </div>

              <motion.div className="space-y-4">
                {[
                  {
                    title: "Direct Access",
                    description: "See who you already know at target companies through your existing network."
                  },
                  {
                    title: "Smart Paths",
                    description: "Discover connectors who can introduce you, with transparency into their success rates."
                  },
                  {
                    title: "Professional Communication",
                    description: "AI-generated introduction templates save time and increase acceptance rates."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-4 rounded-lg border border-border/50 bg-background p-4 hover:border-border transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right side - Visual */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="relative w-full aspect-square max-w-md"
                variants={floatingVariants}
                initial="initial"
                animate="animate"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl" />
                <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-background to-primary/5 p-8 h-full flex flex-col justify-center">
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="h-12 rounded-lg bg-primary/10 flex items-center px-4"
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.3,
                          repeat: Infinity,
                        }}
                      >
                        <div className="h-2 flex gap-1 w-full">
                          {[...Array(4)].map((_, j) => (
                            <motion.div
                              key={j}
                              className="flex-1 h-full rounded bg-primary/40"
                              animate={{
                                scaleY: [1, 1.5, 1],
                              }}
                              transition={{
                                duration: 2,
                                delay: (i * 0.3) + (j * 0.1),
                                repeat: Infinity,
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-32">
        <motion.div
          className="mx-auto w-full max-w-3xl px-4 sm:px-6 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 font-heading text-3xl sm:text-4xl md:text-5xl font-bold">
            Ready to Transform Your Career Path?
          </h2>
          <p className="mb-12 text-base sm:text-lg md:text-xl text-muted-foreground">
            Stop submitting cold applications. Start getting introduced to people who matter.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/signup">
              <Button 
                size="lg" 
                className="gap-2"
                data-testid="button-signup-cta"
              >
                Start Connecting Today
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <motion.div
          className="mx-auto w-full max-w-7xl px-4 sm:px-6 text-center text-xs sm:text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p>© 2024 Confluence. Warm introductions for early-career talent.</p>
        </motion.div>
      </footer>
    </div>
  );
}
