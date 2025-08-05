import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from './tour-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HelpButton() {
  const { startTour } = useTour();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={startTour}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-orchestra-brown hover:bg-orchestra-brown-hover text-white shadow-lg z-50"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-card text-foreground border-border">
          <p>Start guided tour</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}