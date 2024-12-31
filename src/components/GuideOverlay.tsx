// /components/GuideOverlay.tsx
"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from "@/hooks/useTranslations";
import { useGuideSteps } from '@/lib/guideSteps';
import { cn } from '@/lib/utils';

interface GuideOverlayProps {
  onClose: () => void;
}

export default function GuideOverlay({ onClose }: GuideOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const t = useTranslations();
  const steps = useGuideSteps();

  useEffect(() => {
    if (!steps || steps.length === 0) return;

    const element = document.querySelector(steps[currentStep].element);
    if (element) {
      setHighlightedElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      setHighlightedElement(null);
    };
  }, [currentStep, steps]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, []);

  if (!steps || steps.length === 0) {
    return null;
  }

  const handleClose = () => {
    setHighlightedElement(null);
    document.body.classList.remove('guide-mode');
    onClose();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getPopoverPosition = () => {
    if (!highlightedElement) return {};

    const rect = highlightedElement.getBoundingClientRect();
    const position = steps[currentStep].position;
    const popoverHeight = 300;
    const popoverWidth = 400;
    const margin = 20;

    let top = rect.top + window.scrollY;
    let left = rect.left;

    switch (position) {
      case 'top':
        top = top - popoverHeight - margin;
        left = left + (rect.width - popoverWidth) / 2;
        break;
      case 'right':
        top = top + (rect.height - popoverHeight) / 2;
        left = rect.right + margin;
        break;
      case 'bottom':
        top = top + rect.height + margin;
        left = left + (rect.width - popoverWidth) / 2;
        break;
      case 'left':
        top = top + (rect.height - popoverHeight) / 2;
        left = left - popoverWidth - margin;
        break;
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Ensure popover stays within viewport
    left = Math.max(margin, Math.min(left, windowWidth - popoverWidth - margin));
    top = Math.max(margin, Math.min(top, windowHeight - popoverHeight - margin));

    return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      {highlightedElement && (
        <div
          className="absolute z-50 ring-2 ring-blue-500 ring-offset-2 bg-blue-50/10 transition-all duration-300"
          style={{
            top: highlightedElement.getBoundingClientRect().top + window.scrollY,
            left: highlightedElement.getBoundingClientRect().left,
            width: highlightedElement.getBoundingClientRect().width,
            height: highlightedElement.getBoundingClientRect().height,
          }}
        />
      )}

      <div 
        className="fixed z-50 bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        style={getPopoverPosition()}
      >
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <h3 className="text-xl font-semibold mb-2">
          {steps[currentStep].title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {steps[currentStep].description}
        </p>
        
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              currentStep === 0 
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {t.guide.buttons.prev}
          </button>
          
          <span className="text-sm text-gray-500">
            {currentStep + 1} / {steps.length}
          </span>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {t.guide.buttons.close}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {t.guide.buttons.next}
            </button>
          )}
        </div>
      </div>
    </>
  );
}