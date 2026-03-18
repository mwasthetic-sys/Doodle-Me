
export interface ImageItem {
  id: string;
  base64: string;
  mimeType: string;
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  selected: boolean;
  isResult?: boolean;
  assignedColorId?: string; // Color assigned for generation
  resultUrl?: string;
  error?: string;
  modelId?: string;
  resolution?: string;
}

export type AppStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface ColorPalette {
  id: string;
  label: string;
  hex: string;
  shades: string;
  tertiary: string;
}

export interface ModelOption {
  id: string;
  name: string;
  modelName: string;
  description: string;
  resolutions: string[];
}
