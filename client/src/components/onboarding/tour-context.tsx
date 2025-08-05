import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const defaultTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Orchestra!',
    content: "Let's get you started with creating and orchestrating your AI agents. This quick tour will show you the key features."
  },
  {
    id: 'agents',
    title: 'Your AI Agents',
    content: 'This is where your AI agents live. Each agent has a unique role and personality. Click here to create your first agent.',
    target: '[data-tour="agents-tab"]',
    position: 'bottom'
  },
  {
    id: 'create-agent',
    title: 'Create Your First Agent',
    content: 'Give your agent a name, select their role, and write a prompt to define their personality. Think of them as your AI team members.',
    target: '[data-tour="create-agent-button"]',
    position: 'left'
  },
  {
    id: 'workflows',
    title: 'Design Workflows',
    content: 'Connect your agents to create powerful workflows. Drag agents from the sidebar and connect them to build your automation.',
    target: '[data-tour="workflows-tab"]',
    position: 'bottom'
  },
  {
    id: 'conductor',
    title: 'The Conductor Dashboard',
    content: 'Monitor your workflows in real-time. See agent activity, track progress, and intervene if needed.',
    target: '[data-tour="conductor-tab"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: "You're All Set!",
    content: "You're ready to orchestrate AI workflows. Start by creating your first agent or explore the example workflows."
  }
];

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps] = useState<TourStep[]>(defaultTourSteps);

  // Check if user has seen the tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('orchestra-tour-completed');
    
    // Show tour for new users who haven't seen it
    if (!hasSeenTour) {
      setTimeout(() => {
        setIsActive(true);
      }, 1500); // Small delay to let the app load
    }
  }, []);

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('orchestra-tour-completed', 'true');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const skipTour = () => {
    endTour();
  };

  const value: TourContextType = {
    isActive,
    currentStep,
    steps,
    startTour,
    endTour,
    nextStep,
    previousStep,
    goToStep,
    skipTour
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}