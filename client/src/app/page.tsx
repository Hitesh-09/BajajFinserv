"use client";

import { useState } from "react";
import { NodeInput } from "@/components/NodeInput";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ResponseData {
  summary?: {
    total_trees: number;
    total_cycles: number;
    largest_tree_root: string;
  };
  [key: string]: unknown;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const handleSubmit = async (data: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/bfhl" || "http://localhost:8080/bfhl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      if (!res.ok) throw new Error("Failed to process request");
      const result = await res.json();
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header section with Theme Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-border/50"
        >
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              Node Analyzer System
            </h1>
            <p className="text-muted-foreground text-lg font-medium">Bajaj Finserv Logic Engine Diagnostics</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full shadow-md border-border/60 hover:bg-muted"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
            <span className="sr-only">Toggle theme Mode</span>
          </Button>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full flex justify-center"
        >
          <div className="w-full max-w-3xl">
            <NodeInput onSubmit={handleSubmit} isLoading={loading} />
          </div>
        </div>

        {/* Error Handling */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-destructive/10 text-destructive border-l-4 border-destructive p-4 rounded-xl flex items-center space-x-3 shadow-md max-w-3xl mx-auto"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="font-semibold tracking-wide">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {response && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
             >
              <Card className="shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow duration-300 border-2 border-border/50 overflow-hidden bg-card/80 backdrop-blur-sm">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span>
                  Response Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground font-medium">Total Trees</span>
                  <span className="font-bold text-2xl text-primary">{response.summary?.total_trees || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground font-medium">Total Cycles</span>
                  <span className="font-bold text-2xl text-primary">{response.summary?.total_cycles || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Largest Root</span>
                  <span className="font-bold text-2xl text-primary">{response.summary?.largest_tree_root || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

              <Card className="shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow duration-300 border-2 border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-muted/30 border-b border-border/50">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span className="bg-primary shadow-sm shadow-primary/40 text-primary-foreground w-7 h-7 rounded-full inline-flex items-center justify-center text-sm font-bold">2</span>
                    Raw Topology Output
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 h-full">
                  <div className="bg-background border border-border/50 text-muted-foreground p-5 rounded-xl overflow-x-auto h-[240px] shadow-inner font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-muted-foreground/20">
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
