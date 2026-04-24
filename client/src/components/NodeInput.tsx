"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface NodeInputProps {
  onSubmit: (data: string) => void;
  isLoading: boolean;
}

export function NodeInput({ onSubmit, isLoading }: NodeInputProps) {
  const [value, setValue] = useState('');

  return (
    <Card className="w-full shadow-lg border-2 border-primary/10">
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
  );
}
