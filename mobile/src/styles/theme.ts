import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f5f5fc',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#02181f',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
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
    _300: '#e0e0e0',
    _500: '#9e9e9e',
    _700: '#616161',
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
