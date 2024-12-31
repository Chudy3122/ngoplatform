// types/guide.ts
export interface GuideStep {
  element: string;
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  highlightClassName?: string; // Dodajemy tę opcję zamiast styles
}
  
  export interface GuideOverlayProps {
    onClose: () => void;
  }