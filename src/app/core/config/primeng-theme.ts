import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/** Pharma Link / Uber-inspired black & white PrimeNG preset */
export const PharmaLinkPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f5f5f5',
      100: '#e5e5e5',
      200: '#d4d4d4',
      300: '#a3a3a3',
      400: '#737373',
      500: '#000000',
      600: '#000000',
      700: '#000000',
      800: '#000000',
      900: '#000000',
      950: '#000000',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#000000',
          inverseColor: '#ffffff',
          hoverColor: '#282828',
          activeColor: '#000000',
        },
        surface: {
          0: '#ffffff',
          50: '#f3f3f3',
          100: '#efefef',
          200: '#e2e2e2',
          300: '#afafaf',
          400: '#5e5e5e',
          500: '#4b4b4b',
          600: '#282828',
          700: '#1a1a1a',
          800: '#0d0d0d',
          900: '#000000',
          950: '#000000',
        },
      },
    },
  },
});
