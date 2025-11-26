// Theme definitions for the application
export interface ThemeColors {
  name: string;
  bg: string;
  card: string;
  border: string;
  hover: string;
  textPrimary: string;
  textSecondary: string;
}

export const THEMES: Record<string, ThemeColors> = {
  light: {
    name: 'Light',
    bg: '#f9fafb',
    card: '#ffffff',
    border: '#e5e7eb',
    hover: '#f3f4f6',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
  },
  dark: {
    name: 'Dark',
    bg: '#0a0e1a',
    card: '#141824',
    border: '#1f2937',
    hover: '#1f2937',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
  },
};

export type ThemeName = keyof typeof THEMES;

export const applyTheme = (themeName: ThemeName) => {
  const theme = THEMES[themeName];
  const root = document.documentElement;

  // Set CSS variables
  root.style.setProperty('--theme-bg', theme.bg);
  root.style.setProperty('--theme-card', theme.card);
  root.style.setProperty('--theme-border', theme.border);
  root.style.setProperty('--theme-hover', theme.hover);
  root.style.setProperty('--theme-text-primary', theme.textPrimary);
  root.style.setProperty('--theme-text-secondary', theme.textSecondary);

  // Add/remove dark mode class for Tailwind
  if (themeName === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
};
