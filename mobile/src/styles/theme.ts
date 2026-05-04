import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#04303f',
    background: '#f9f9fb',
    container: '#fff',
    icon: '#687076',
    border: '#0a7da4',
    tabIconDefault: '#687076',
    button: '#06556f',
  },
  dark: {
    text: '#ECEDEE',
    background: '#02181f',
    container: '#03222b',
    icon: '#9BA1A6',
    border: '#0a7da4',
    tabIconDefault: '#9BA1A6',
    button: '#04303f',
  },
  branding: {
    _300: '#bae4f2',
    _400: '#44c0e9',
    _500: '#0a7da4',
    _600: '#06556f',
    _700: '#04303f',
    _800: '#02181f',
  },
  green: {
    _300: '#b2f2bb',
    _400: '#69db7c',
    _500: '#2ab14b',
    _600: '#1b7a32',
    _700: '#0f3f19',
  },
  red: {
    _300: '#ffb3b3',
    _400: '#ff6666',
    _500: '#ff1a1a',
    _600: '#b30000',
    _700: '#660000',
  },
  orange: {
    _300: '#ffcf86',
    _500: '#ff9a4d',
    _700: '#b36b00',
  },
  yellow: {
    _300: '#fff3b0',
    _500: '#ffe066',
    _700: '#b38f00',
  },
  grey: {
    _300: 'hsl(0, 0%, 85%)',
    _400: 'hsl(0, 0%, 70%)',
    _500: 'hsl(0, 0%, 60%)',
    _600: 'hsl(0, 0%, 50%)',
    _700: 'hsl(0, 0%, 35%)',
  },
  blue: {
    _300: '#b3d9ff',
    _500: '#66b3ff',
    _700: '#1a8cff',
  }
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
