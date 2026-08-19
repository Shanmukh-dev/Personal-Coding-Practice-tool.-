export interface ThemeColorPalette {
  bg: string;
  card: string;
  border: string;
  accent: string;
  text: string;
  secondaryText?: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  mode: 'dark' | 'light' | 'auto';
  isMainDark?: boolean;
  palette: ThemeColorPalette;
  tags: string[];
}

export const THEME_LIST: ThemeDefinition[] = [
  {
    id: 'dark',
    name: 'Omega Dark',
    subtitle: 'Extension Pitch Theme (Main Dark)',
    description: 'Matches the Chrome Extension popup: #09090b canvas, #121215 surfaces, #27272a borders, and high-contrast #f4f4f5 typography.',
    mode: 'dark',
    isMainDark: true,
    palette: {
      bg: '#09090b',
      card: '#121215',
      border: '#27272a',
      accent: '#3b82f6',
      text: '#f4f4f5',
      secondaryText: '#a1a1aa',
    },
    tags: ['extension', 'main', 'default', 'pitch', 'dark', 'minimal', 'zinc', 'omega'],
  },
  {
    id: 'light',
    name: 'Vellum Technical',
    subtitle: 'Crisp Technical Light Mode',
    description: 'Clean off-white canvas (#f7f9fb), high-contrast slate text, subtle grey borders (#e2e8f0), and sharp Hanken Grotesk typography.',
    mode: 'light',
    palette: {
      bg: '#f7f9fb',
      card: '#ffffff',
      border: '#e2e8f0',
      accent: '#0f172a',
      text: '#191c1e',
      secondaryText: '#76777d',
    },
    tags: ['light', 'vellum', 'day', 'white', 'clean', 'technical', 'hanken'],
  },
  {
    id: 'obsidian-slate',
    name: 'Obsidian Slate',
    subtitle: 'Midnight Deep Blue Dark',
    description: 'Low-chroma midnight slate background (#0b1326), deep navy cards (#131b2e), and slate-white accents (#dae2fd).',
    mode: 'dark',
    palette: {
      bg: '#0b1326',
      card: '#131b2e',
      border: '#334155',
      accent: '#38bdf8',
      text: '#dae2fd',
      secondaryText: '#8e9195',
    },
    tags: ['slate', 'obsidian', 'navy', 'midnight', 'blue', 'dark', 'deep'],
  },
  {
    id: 'cyberpunk-matrix',
    name: 'Cyberpunk Matrix',
    subtitle: 'Neon Hacker Terminal',
    description: 'Deep terminal black (#050505), high-tech neon green (#10b981 / #00ff66) highlights, and monochrome card surfaces.',
    mode: 'dark',
    palette: {
      bg: '#050505',
      card: '#0d1117',
      border: '#21262d',
      accent: '#10b981',
      text: '#e6edf3',
      secondaryText: '#8b949e',
    },
    tags: ['cyberpunk', 'matrix', 'terminal', 'hacker', 'neon', 'green', 'code'],
  },
  {
    id: 'sunset-crimson',
    name: 'Sunset Crimson',
    subtitle: 'Warm Amber & Rose Glow',
    description: 'Charcoal wine canvas (#0f0d0e), warm burgundy cards (#1c1417), and vibrant sunset amber accents (#f97316).',
    mode: 'dark',
    palette: {
      bg: '#0f0d0e',
      card: '#1c1417',
      border: '#432c34',
      accent: '#f97316',
      text: '#fde047',
      secondaryText: '#fca5a5',
    },
    tags: ['sunset', 'crimson', 'amber', 'rose', 'warm', 'burgundy', 'orange'],
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    subtitle: 'Sub-Zero Arctic Slate',
    description: 'Arctic twilight canvas (#0f141c), frosty polar surfaces (#161f2c), and electric cyan-indigo accents (#38bdf8).',
    mode: 'dark',
    palette: {
      bg: '#0f141c',
      card: '#161f2c',
      border: '#2d3f5c',
      accent: '#38bdf8',
      text: '#e2e8f0',
      secondaryText: '#94a3b8',
    },
    tags: ['nordic', 'frost', 'arctic', 'cyan', 'polar', 'ice', 'cold', 'blue'],
  },
  {
    id: 'system',
    name: 'System Default',
    subtitle: 'Synchronized with OS Mode',
    description: 'Automatically switches between Omega Dark and Vellum Technical according to your operating system appearance preference.',
    mode: 'auto',
    palette: {
      bg: '#09090b',
      card: '#121215',
      border: '#27272a',
      accent: '#3b82f6',
      text: '#f4f4f5',
      secondaryText: '#a1a1aa',
    },
    tags: ['system', 'auto', 'os', 'adaptive', 'dynamic'],
  },
];

export function getThemeById(id: string): ThemeDefinition {
  return THEME_LIST.find((t) => t.id === id) || THEME_LIST[0];
}
