export type FontOption = {
  id: string;
  label: string;
  fontFamily: string; // CSS font-family stack, primary first
  availableWeights?: number[]; // e.g., [300,400,500,700]
  supportsItalic?: boolean;
};

// System stack first (no network load)
const SYSTEM_STACK = "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";

export const FONT_CATALOG: readonly FontOption[] = [
  {
    id: 'system',
    label: 'System Default',
    fontFamily: SYSTEM_STACK,
  },
  {
    id: 'satoshi',
    label: 'Satoshi',
    fontFamily: "'Satoshi', " + SYSTEM_STACK,
    availableWeights: [300, 400, 500, 700, 900],
    supportsItalic: true,
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    fontFamily: "'Space Grotesk', " + SYSTEM_STACK,
    availableWeights: [300, 400, 500, 600, 700],
    supportsItalic: false,
  },
  {
    id: 'supreme',
    label: 'Supreme',
    fontFamily: "'Supreme', " + SYSTEM_STACK,
    availableWeights: [100, 200, 300, 400, 500, 700, 800],
    supportsItalic: true,
  },
  {
    id: 'britney',
    label: 'Britney',
    fontFamily: "'Britney', " + SYSTEM_STACK,
    availableWeights: [300, 400, 700, 800], // Light, Regular, Bold, Ultra
    supportsItalic: false,
  },
  {
    id: 'comico',
    label: 'Comico',
    fontFamily: "'Comico', " + SYSTEM_STACK,
    availableWeights: [400],
    supportsItalic: false,
  },
  {
    id: 'boxing',
    label: 'Boxing',
    fontFamily: "'Boxing', " + SYSTEM_STACK,
    availableWeights: [400],
    supportsItalic: false,
  },
  {
    id: 'erode',
    label: 'Erode',
    fontFamily: "'Erode', " + SYSTEM_STACK,
    availableWeights: [300, 400, 500, 600, 700], // Light, Regular, Medium, Semibold, Bold
    supportsItalic: true,
  },
  {
    id: 'pramukh-rounded',
    label: 'Pramukh Rounded',
    fontFamily: "'PramukhRounded', " + SYSTEM_STACK,
    availableWeights: [200, 300, 350, 400, 600, 700, 800, 900], // Extralight, Light, Semilight(350), Regular, Semibold, Bold, Extrabold, Black
    supportsItalic: true,
  },
];

const loadedFontKeys = new Set<string>();

function getFontFaceSources(familyId: string, weight: number, style: 'normal' | 'italic'): string[] {
  // Map curated families to the local public file paths. Prefer woff2 → woff → ttf for modern browsers.
  const base = '/fonts';
  const sources: string[] = [];
  if (familyId === 'satoshi') {
    // Map weights to specific file names
    const nameMap: Record<string, string> = {
      '300-normal': 'Satoshi-Light',
      '300-italic': 'Satoshi-LightItalic',
      '400-normal': 'Satoshi-Regular',
      '400-italic': 'Satoshi-Italic',
      '500-normal': 'Satoshi-Medium',
      '500-italic': 'Satoshi-MediumItalic',
      '700-normal': 'Satoshi-Bold',
      '700-italic': 'Satoshi-BoldItalic',
      '900-normal': 'Satoshi-Black',
      '900-italic': 'Satoshi-BlackItalic',
    };
    const key = `${weight}-${style}`;
    const file = nameMap[key];
    if (file) {
      sources.push(`${base}/Satoshi/${file}.woff2`, `${base}/Satoshi/${file}.woff`, `${base}/Satoshi/${file}.ttf`);
    } else {
      // fallback to Regular
      sources.push(`${base}/Satoshi/Satoshi-Regular.woff2`, `${base}/Satoshi/Satoshi-Regular.woff`, `${base}/Satoshi/Satoshi-Regular.ttf`);
    }
  } else if (familyId === 'space-grotesk') {
    const nameMap: Record<string, string> = {
      '300-normal': 'SpaceGrotesk-Light',
      '400-normal': 'SpaceGrotesk-Regular',
      '500-normal': 'SpaceGrotesk-Medium',
      '600-normal': 'SpaceGrotesk-SemiBold',
      '700-normal': 'SpaceGrotesk-Bold',
    };
    const key = `${weight}-${style}`;
    const file = nameMap[key] || nameMap['400-normal'];
    sources.push(`${base}/SpaceGrotesk/${file}.woff2`, `${base}/SpaceGrotesk/${file}.woff`, `${base}/SpaceGrotesk/${file}.ttf`);
  } else if (familyId === 'supreme') {
    const nameMap: Record<string, string> = {
      '100-normal': 'Supreme-Thin',
      '100-italic': 'Supreme-ThinItalic',
      '200-normal': 'Supreme-Extralight',
      '200-italic': 'Supreme-ExtralightItalic',
      '300-normal': 'Supreme-Light',
      '300-italic': 'Supreme-LightItalic',
      '400-normal': 'Supreme-Regular',
      '400-italic': 'Supreme-Italic',
      '500-normal': 'Supreme-Medium',
      '500-italic': 'Supreme-MediumItalic',
      '700-normal': 'Supreme-Bold',
      '700-italic': 'Supreme-BoldItalic',
      '800-normal': 'Supreme-Extrabold',
      '800-italic': 'Supreme-ExtraboldItalic',
    };
    const key = `${weight}-${style}`;
    const file = nameMap[key] || nameMap['400-normal'];
    sources.push(`${base}/Supreme/${file}.woff2`, `${base}/Supreme/${file}.woff`, `${base}/Supreme/${file}.ttf`);
  } else if (familyId === 'britney') {
    const nameMap: Record<string, string> = {
      '300-normal': 'Britney-Light',
      '400-normal': 'Britney-Regular',
      '700-normal': 'Britney-Bold',
      '800-normal': 'Britney-Ultra',
    };
    const key = `${weight}-${style}`;
    const file = nameMap[key] || nameMap['400-normal'];
    sources.push(`${base}/Britney/${file}.woff2`, `${base}/Britney/${file}.woff`, `${base}/Britney/${file}.ttf`);
  } else if (familyId === 'comico') {
    const file = 'Comico-Regular';
    sources.push(`${base}/Comico/${file}.woff2`, `${base}/Comico/${file}.woff`, `${base}/Comico/${file}.ttf`);
  } else if (familyId === 'boxing') {
    const file = 'Boxing-Regular';
    sources.push(`${base}/Boxing/${file}.woff2`, `${base}/Boxing/${file}.woff`, `${base}/Boxing/${file}.ttf`);
  } else if (familyId === 'erode') {
    const nameMap: Record<string, string> = {
      '300-normal': 'Erode-Light',
      '300-italic': 'Erode-LightItalic',
      '400-normal': 'Erode-Regular',
      '400-italic': 'Erode-Italic',
      '500-normal': 'Erode-Medium',
      '500-italic': 'Erode-MediumItalic',
      '600-normal': 'Erode-Semibold',
      '600-italic': 'Erode-SemiboldItalic',
      '700-normal': 'Erode-Bold',
      '700-italic': 'Erode-BoldItalic',
    };
    const key = `${weight}-${style}`;
    const file = nameMap[key] || nameMap['400-normal'];
    sources.push(`${base}/Erode/${file}.woff2`, `${base}/Erode/${file}.woff`, `${base}/Erode/${file}.ttf`);
  } else if (familyId === 'pramukh-rounded') {
    const nameMap: Record<string, string> = {
      '200-normal': 'PramukhRounded-Extralight',
      '200-italic': 'PramukhRounded-ExtralightItalic',
      '300-normal': 'PramukhRounded-Light',
      '300-italic': 'PramukhRounded-LightItalic',
      '350-normal': 'PramukhRounded-Semilight',
      '350-italic': 'PramukhRounded-SemilightItalic',
      '400-normal': 'PramukhRounded-Regular',
      '400-italic': 'PramukhRounded-Italic',
      '600-normal': 'PramukhRounded-Semibold',
      '600-italic': 'PramukhRounded-SemiboldItalic',
      '700-normal': 'PramukhRounded-Bold',
      '700-italic': 'PramukhRounded-BoldItalic',
      '800-normal': 'PramukhRounded-Extrabold',
      '800-italic': 'PramukhRounded-ExtraboldItalic',
      '900-normal': 'PramukhRounded-Black',
      '900-italic': 'PramukhRounded-BlackItalic',
    };
    const key = `${weight}-${style}`;
    const file = nameMap[key] || nameMap['400-normal'];
    sources.push(`${base}/PramukhRounded/${file}.woff2`, `${base}/PramukhRounded/${file}.woff`, `${base}/PramukhRounded/${file}.ttf`);
  }
  return sources;
}

export async function ensureFontLoaded(
  familyId: string,
  fontFamilyCssName: string,
  weight: number = 400,
  style: 'normal' | 'italic' = 'normal'
): Promise<void> {
  if (familyId === 'system') return; // nothing to load
  const loadKey = `${familyId}-${weight}-${style}`;
  if (loadedFontKeys.has(loadKey)) return;

  const sources = getFontFaceSources(familyId, weight, style);
  if (!sources.length) {
    loadedFontKeys.add(loadKey);
    return;
  }

  // Build a src descriptor prioritizing woff2
  const src = sources
    .map((url) => {
      const fmt = url.endsWith('.woff2') ? 'woff2' : url.endsWith('.woff') ? 'woff' : 'truetype';
      return `url(${url}) format('${fmt}')`;
    })
    .join(', ');

  const face = new FontFace(fontFamilyCssName.replace(/^'/, '').replace(/'$/, ''), src, { weight: String(weight), style });
  // Load and add to document
  const loaded = await face.load();
  (document as any).fonts.add(loaded);
  loadedFontKeys.add(loadKey);
}

export type TitleTypography = {
  familyId: string; // stable id from catalog
  weight?: number;
  style?: 'normal' | 'italic';
};


