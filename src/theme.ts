// Palette taken from the concept mockups: aged paper, olive green, earth brown.
export const colors = {
  paper: '#F1E8D6',
  paperDeep: '#E6DAC1',
  card: '#FBF6EC',
  ink: '#2B2418',
  inkSoft: '#6B5E4A',
  line: '#D8CAAE',
  olive: '#4A5A2E',
  oliveDark: '#2F3A1D',
  oliveLight: '#7C8B57',
  earth: '#7A4E2D',
  ember: '#C8862F',
  night: '#1C1A14',
  nightSoft: '#2A2720',
  stampRed: '#A33B2B',
  white: '#FFFFFF',
  locked: '#9C9282',
};

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 };
export const space = (n: number) => n * 4;

export const fonts = {
  // System serif keeps the "archival" feel without bundling font files.
  display: 'Georgia',
};

export const shadow = { boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)' } as const;

/**
 * Full-bleed image style. On web, react-native-web sizes an <Image> from its
 * intrinsic dimensions unless width/height are given, so absoluteFill alone
 * is not enough.
 */
export const fill = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' } as const;
