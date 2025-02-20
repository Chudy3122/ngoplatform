// /lib/guideSteps.ts
import { GuideStep } from "../../types/guide";
import { useTranslations } from "@/hooks/useTranslations";

export const useGuideSteps = (): GuideStep[] => {
  const t = useTranslations();
  
  return [
    {
      element: ".menu-home",
      title: t.guide.steps.home.title,
      description: t.guide.steps.home.description,
      position: "right"
    },
    {
      element: ".menu-announcements",
      title: t.guide.steps.announcementsSection.title,
      description: t.guide.steps.announcementsSection.description,
      position: "right"
    },
    {
      element: ".menu-events",
      title: t.guide.steps.events.title,
      description: t.guide.steps.events.description,
      position: "right"
    },
    {
      element: ".menu-messages",
      title: t.guide.steps.messages.title,
      description: t.guide.steps.messages.description,
      position: "right"
    },
    {
      element: ".menu-todo",
      title: t.guide.steps.todo.title,
      description: t.guide.steps.todo.description,
      position: "right"
    },
    {
      element: ".menu-library",
      title: t.guide.steps.library.title,
      description: t.guide.steps.library.description,
      position: "right"
    },
    {
      element: ".menu-resources",
      title: t.guide.steps.resources.title,
      description: t.guide.steps.resources.description,
      position: "right"
    },
    {
      element: ".menu-sharedfiles",
      title: t.guide.steps.sharedFiles.title,
      description: t.guide.steps.sharedFiles.description,
      position: "right"
    },
    {
      element: ".menu-video",
      title: t.guide.steps.videoComm.title,
      description: t.guide.steps.videoComm.description,
      position: "right"
    },
    {
      element: ".menu-calculator",
      title: t.guide.steps.calculator.title,
      description: t.guide.steps.calculator.description,
      position: "right"
    },
    {
      element: ".menu-energy",
      title: t.guide.steps.energy.title,
      description: t.guide.steps.energy.description,
      position: "right"
    },
    {
      element: ".menu-financing",
      title: t.guide.steps.financing.title,
      description: t.guide.steps.financing.description,
      position: "right"
    },
    {
      element: "button[data-guide='language-switcher']",
      title: t.guide.steps.languageSwitcher.title,
      description: t.guide.steps.languageSwitcher.description,
      position: "bottom"
    },
    {
      element: ".guide-button",
      title: t.guide.steps.guideButton.title,
      description: t.guide.steps.guideButton.description,
      position: "bottom"
    },
    {
      element: ".guide-section-news",
      title: t.guide.steps.news.title,
      description: t.guide.steps.news.description,
      position: "bottom"
    },
    {
      element: ".guide-section-calendar-events",
      title: t.guide.steps.calendarEvents.title,
      description: t.guide.steps.calendarEvents.description,
      position: "left"
    },
    {
      element: ".guide-section-announcements",
      title: t.guide.steps.announcements.title,
      description: t.guide.steps.announcements.description,
      position: "left"
    },
    {
      element: ".chat-widget-button",
      title: t.guide.steps.assistant.title,
      description: t.guide.steps.assistant.description,
      position: "left"
    }
  ];
};