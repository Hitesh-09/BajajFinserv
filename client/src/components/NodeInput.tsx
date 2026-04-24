"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface NodeInputProps {
  onSubmit: (data: string) => void;
  isLoading: boolean;
}

export function NodeInput({ onSubmit, isLoading }: NodeInputProps) {
  const [value, setValue] = useState('');

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card className="w-full shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow duration-300 border-2 border-primary/20 bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Tree Node Input</CardTitle>
        <CardDescription>Enter your nodes data accurately to process the hierarchy.</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder='e.g. {"A": ["B", "C"]}'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[160px] font-mono resize-y text-base p-4 focus-visible:ring-primary/50"
        />
      </CardContent>
      <CardFooter className="flex justify-end bg-muted/30 pt-4 pb-4 px-6 border-t">
        <Button 
          onClick={() => onSubmit(value)} 
          disabled={!value.trim() || isLoading}
          size="lg"
          className="font-semibold shadow-md active:scale-95 transition-all"
        >
          {isLoading ? 'Processing...' : 'Analyze Nodes'}
        </Button>
      </CardFooter>
    </Card>
    </motion.div>
  );
}
