// /app/[lang]/list/guide/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from "@/hooks/useTranslations";

interface GuideStep {
  element: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export default function GuidePage() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const t = useTranslations();

  const GUIDE_STEPS: GuideStep[] = [
    {
      element: ".menu-home",
      title: t.guide.steps.home.title,
      description: t.guide.steps.home.description,
      position: "right"
    },
    {
      element: ".menu-announcements",
      title: t.guide.steps.announcements.title,
      description: t.guide.steps.announcements.description,
      position: "right"
    },
    {
      element: ".news-categories",
      title: t.guide.steps.news.title,
      description: t.guide.steps.news.description,
      position: "bottom"
    },
    {
      element: ".calculator-section",
      title: t.guide.steps.calculator.title,
      description: t.guide.steps.calculator.description,
      position: "left"
    }
  ];

  useEffect(() => {
    if (!isActive) return;

    const element = document.querySelector(GUIDE_STEPS[currentStep].element);
    if (element) {
      setHighlightedElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      setHighlightedElement(null);
    };
  }, [currentStep, isActive]);

  const startGuide = () => {
    setIsActive(true);
    setCurrentStep(0);
    document.body.classList.add('guide-mode');
  };

  const nextStep = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const endGuide = () => {
    setIsActive(false);
    setCurrentStep(0);
    document.body.classList.remove('guide-mode');
  };

  if (!isActive) {
    return (
      <div className="flex-1 m-4 mt-0">
        <div className="bg-white p-6 rounded-md text-center">
          <h2 className="text-2xl font-semibold mb-4">{t.guide.title}</h2>
          <p className="text-gray-600 mb-8">
            {t.guide.description}
          </p>
          <button
            onClick={startGuide}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t.guide.buttons.start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={endGuide} />
      
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

      <div className="fixed z-50 bg-white p-6 rounded-lg shadow-xl max-w-md">
        <h3 className="text-xl font-semibold mb-2">
          {GUIDE_STEPS[currentStep].title}
        </h3>
        <p className="text-gray-600 mb-6">
          {GUIDE_STEPS[currentStep].description}
        </p>
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
          >
            {t.guide.buttons.prev}
          </button>
          <div className="flex gap-4">
            <button
              onClick={endGuide}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              {t.guide.buttons.close}
            </button>
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {currentStep === GUIDE_STEPS.length - 1 ? t.guide.buttons.close : t.guide.buttons.next}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}