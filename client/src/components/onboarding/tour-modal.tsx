import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { useTour } from './tour-context';
import { Button } from '@/components/ui/button';

export function TourModal() {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipTour,
    endTour
  } = useTour();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: '50%', left: '50%' });

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData.target) {
      setTargetElement(null);
      return;
    }

    // Find the target element
    const element = document.querySelector(currentStepData.target) as HTMLElement;
    setTargetElement(element);

    if (element) {
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Calculate position based on target element
      const rect = element.getBoundingClientRect();
      let top = rect.top;
      let left = rect.left;

      switch (currentStepData.position) {
        case 'top':
          top = rect.top - 250;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 350;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 20;
          break;
      }

      // Keep within viewport bounds
      const modalWidth = 320;
      const modalHeight = 200;
      
      if (left + modalWidth > window.innerWidth) {
        left = window.innerWidth - modalWidth - 20;
      }
      if (left < 20) {
        left = 20;
      }
      if (top + modalHeight > window.innerHeight) {
        top = window.innerHeight - modalHeight - 20;
      }
      if (top < 20) {
        top = 20;
      }

      setModalPosition({ top: `${top}px`, left: `${left}px` });
    } else {
      // Center the modal if no target
      setModalPosition({ top: '50%', left: '50%' });
    }
  }, [isActive, currentStepData, currentStep]);

  if (!isActive) return null;

  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Backdrop with spotlight effect */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={skipTour}
          >
            <div className="absolute inset-0 bg-black/60" />
            {targetElement && (
              <motion.div
                className="absolute ring-4 ring-[#c85a3a]/50 rounded-lg"
                style={{
                  top: targetElement.getBoundingClientRect().top - 4,
                  left: targetElement.getBoundingClientRect().left - 4,
                  width: targetElement.offsetWidth + 8,
                  height: targetElement.offsetHeight + 8,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Modal */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 max-w-sm"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
              transform: targetElement ? 'none' : 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Close button */}
            <button
              onClick={skipTour}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            {/* Content */}
            <div className="text-center mb-6 mt-2">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentStepData.content}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 mb-4">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (index <= currentStep) {
                      // Allow going back to previous steps
                      const diff = currentStep - index;
                      for (let i = 0; i < diff; i++) {
                        previousStep();
                      }
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-[#c85a3a] w-6'
                      : index < currentStep
                      ? 'bg-[#c85a3a]/50'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousStep}
                disabled={currentStep === 0}
                className="text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-gray-500 dark:text-gray-400"
              >
                <SkipForward className="w-4 h-4 mr-1" />
                Skip tour
              </Button>

              <Button
                size="sm"
                onClick={isLastStep ? endTour : nextStep}
                className="bg-[#c85a3a] hover:bg-[#a84830] text-white"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}