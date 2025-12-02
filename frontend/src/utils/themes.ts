// Premium Ultra-Minimal Theme System
// Charcoal Black (#0F0F0F) • Pure White (#FFFFFF) • Teal Accent (#24C8D8)
export interface ThemeColors {
  name: string;
  bg: string;
  card: string;
  border: string;
  hover: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  glass: string;
  shadow: string;
  glow: string;
}

export const THEMES: Record<string, ThemeColors> = {
  light: {
    name: 'Light',
    bg: '#F4F4F5',
    card: 'rgba(255,255,255,0.65)',
    border: 'rgba(0, 0, 0, 0.05)',
    hover: 'rgba(46, 196, 182, 0.08)',
    textPrimary: '#1A1A1A',
    textSecondary: '#525252',
    accent: '#2EC4B6',
    accentHover: '#3DD9CA',
    glass: 'rgba(255, 255, 255, 0.65)',
    shadow: 'rgba(0, 0, 0, 0.06)',
    glow: 'rgba(46, 196, 182, 0.18)',
  },
  dark: {
    name: 'Dark',
    bg: '#0A0A0A',
    card: '#1A1A1A',
    border: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(88, 166, 175, 0.1)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    accent: '#58A6AF',
    accentHover: '#6BB8C1',
    glass: 'rgba(26, 26, 26, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.4)',
    glow: 'rgba(88, 166, 175, 0.15)',
  },
};

export type ThemeName = keyof typeof THEMES;

export const applyTheme = (themeName: ThemeName) => {
  const theme = THEMES[themeName];
  const root = document.documentElement;

  // Apply premium design tokens
  root.style.setProperty('--theme-bg', theme.bg);
  root.style.setProperty('--theme-card', theme.card);
  root.style.setProperty('--theme-border', theme.border);
  root.style.setProperty('--theme-hover', theme.hover);
  root.style.setProperty('--theme-text-primary', theme.textPrimary);
  root.style.setProperty('--theme-text-secondary', theme.textSecondary);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-accent-hover', theme.accentHover);
  root.style.setProperty('--theme-glass', theme.glass);
  root.style.setProperty('--theme-shadow', theme.shadow);
  root.style.setProperty('--theme-glow', theme.glow);

  // Add/remove dark mode class for Tailwind
  if (themeName === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
};
