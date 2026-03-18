
import { ColorPalette, ModelOption } from './types';

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'red',
    label: 'Radiant Red',
    hex: '#ef4444',
    shades: 'crimson, scarlet, and ruby reds',
    tertiary: 'soft coral and deep maroon'
  },
  {
    id: 'orange',
    label: 'Organic Orange',
    hex: '#f97316',
    shades: 'hyper-saturated neon orange, electric tangerine, and intense orange',
    tertiary: 'fluorescent peach and fiery vermilion'
  },
  {
    id: 'yellow',
    label: 'Yielding Yellow',
    hex: '#eab308',
    shades: 'lemon, gold, and bright canary yellow',
    tertiary: 'pale lime and honey'
  },
  {
    id: 'green',
    label: 'Vivid Green',
    hex: '#22c55e',
    shades: 'emerald, lime, and apple greens',
    tertiary: 'forest green and mint'
  },
  {
    id: 'blue',
    label: 'Brilliant Blue',
    hex: '#3b82f6',
    shades: 'cobalt, azure, and electric blue',
    tertiary: 'navy and sky blue'
  },
  {
    id: 'indigo',
    label: 'Intense Indigo',
    hex: '#6366f1',
    shades: 'deep indigo, midnight blue, and plum',
    tertiary: 'lavender and cool gray'
  },
  {
    id: 'violet',
    label: 'Vibrant Violet',
    hex: '#a855f7',
    shades: 'amethyst, magenta, and orchid',
    tertiary: 'plum and rose'
  },
  {
    id: 'brown',
    label: 'Bold Brown',
    hex: '#78350f',
    shades: 'rich chocolate, dark cocoa, and espresso browns',
    tertiary: 'caramel and burnt sienna'
  },
  {
    id: 'greyscale',
    label: 'Graphic Grey',
    hex: '#64748b',
    shades: 'stark black, deep charcoal, and silver greys',
    tertiary: 'pure white and slate accents'
  },
  {
    id: 'cream',
    label: 'Classic Cream',
    hex: '#fef3c7',
    shades: 'soft cream, pearl white, ivory, and shades of white',
    tertiary: 'light ash grey and warm beige'
  }
];

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'flash-2.5',
    name: 'Gemini 2.5 Flash',
    modelName: 'gemini-2.5-flash-image',
    description: 'Fast and reliable for standard vector art.',
    resolutions: ['1K']
  },
  {
    id: 'nanobanana2',
    name: 'Nanobanana 2',
    modelName: 'gemini-3.1-flash-image-preview',
    description: 'High performance with multiple resolution support.',
    resolutions: ['512px', '1K', '2K', '4K']
  },
  {
    id: 'pro',
    name: 'Gemini Pro',
    modelName: 'gemini-3-pro-image-preview',
    description: 'The ultimate model for high-fidelity professional art.',
    resolutions: ['1K', '2K', '4K']
  }
];

export const APP_NAME = "Doodle Me";
