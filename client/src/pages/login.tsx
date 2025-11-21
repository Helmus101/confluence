import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { loginUserSchema, type LoginUser, type User } from "@shared/schema";
import { Network, CheckCircle2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const rotateVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      duration: 0.8,
    },
  },
};

const slideVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.23, 1, 0.320, 1],
    },
  },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setShowSuccess(true);
      setTimeout(() => {
        login(data.user);
        toast({ title: "Welcome back!", description: "You've successfully logged in." });
        setLocation("/dashboard");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <motion.div 
      className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background px-4 py-8 sm:py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-primary rounded-full blur-3xl"
          animate={{
            y: [0, -50, 0],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </motion.div>

      <motion.div 
        className="w-full max-w-sm sm:max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div 
          className="mb-8 text-center"
          variants={itemVariants}
        >
          <motion.div 
            className="mb-4 flex justify-center"
            variants={rotateVariants}
          >
            <motion.div 
              className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/60"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Network className="h-6 w-6 text-primary-foreground" />
            </motion.div>
          </motion.div>
          <motion.h1 
            className="mb-2 font-heading text-3xl font-semibold"
            variants={itemVariants}
          >
            Welcome back
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            variants={itemVariants}
          >
            Log in to continue to your account
          </motion.p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border border-primary/10 bg-background/80 backdrop-blur-md shadow-2xl">
            <CardHeader>
              <CardTitle>Log In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              {showSuccess ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-8"
                  variants={successVariants}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
                    transition={{ duration: 0.6 }}
                  >
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </motion.div>
                  <motion.p 
                    className="mt-4 text-center font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Logging you in...
                  </motion.p>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                    <motion.div variants={slideVariants}>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="you@university.edu" 
                                data-testid="input-email" 
                                {...field}
                                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={slideVariants}>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                data-testid="input-password" 
                                {...field}
                                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-submit"
                      >
                        {loginMutation.isPending ? "Logging in..." : "Log In"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              )}
              
              {!showSuccess && (
                <motion.div 
                  className="mt-4 text-center text-sm"
                  variants={itemVariants}
                >
                  Don't have an account?{" "}
                  <Link href="/signup">
                    <motion.a 
                      className="text-primary hover:underline" 
                      data-testid="link-signup"
                      whileHover={{ scale: 1.05 }}
                    >
                      Sign up
                    </motion.a>
                  </Link>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
