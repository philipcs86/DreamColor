
export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ImageSize = '1K' | '2K' | '4K';

// Define AIStudio interface to align with the global environment expectations
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Augment global types for AI Studio environment
declare global {
  interface Window {
    // Fixed: Removed readonly and updated type to AIStudio to match global declarations
    aistudio: AIStudio;
  }
}
