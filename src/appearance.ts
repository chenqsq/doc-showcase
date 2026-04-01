import type { CSSProperties } from 'react';

export type ThemeId = 'warm-paper' | 'sage-mist' | 'mist-blue' | 'stone-sand' | 'night-ink';
export type FontScaleId = 'standard' | 'comfortable' | 'large';

export interface AppearanceState {
  themeId: ThemeId;
  fontScale: FontScaleId;
}

interface FontScalePreset {
  id: FontScaleId;
  label: string;
  hint: string;
  vars: Record<`--${string}`, string>;
}

interface MermaidThemeConfig {
  darkMode: boolean;
  themeVariables: Record<string, string>;
}

interface ThemePreset {
  id: ThemeId;
  label: string;
  tone: string;
  swatches: [string, string, string];
  vars: Record<`--${string}`, string>;
  mermaid: MermaidThemeConfig;
}

const APPEARANCE_KEY = 'doc-showcase-appearance';

export const DEFAULT_APPEARANCE: AppearanceState = {
  themeId: 'warm-paper',
  fontScale: 'comfortable'
};

export const FONT_SCALE_PRESETS: FontScalePreset[] = [
  {
    id: 'standard',
    label: '标准',
    hint: '17px',
    vars: {
      '--ui-font-size': '15.5px',
      '--reader-font-size': '17px',
      '--reader-line-height': '1.82',
      '--reader-measure': '50rem'
    }
  },
  {
    id: 'comfortable',
    label: '舒适',
    hint: '18.5px',
    vars: {
      '--ui-font-size': '16px',
      '--reader-font-size': '18.5px',
      '--reader-line-height': '1.9',
      '--reader-measure': '52rem'
    }
  },
  {
    id: 'large',
    label: '放大',
    hint: '20px',
    vars: {
      '--ui-font-size': '16.8px',
      '--reader-font-size': '20px',
      '--reader-line-height': '1.94',
      '--reader-measure': '54rem'
    }
  }
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'warm-paper',
    label: '暖米纸',
    tone: '柔和米白',
    swatches: ['#f7f1e4', '#d8b18f', '#2b2622'],
    vars: {
      '--body-backdrop-start': '#191b21',
      '--body-backdrop-mid': '#201d21',
      '--body-backdrop-end': '#16171c',
      '--body-backdrop-glow': 'rgba(203, 126, 85, 0.2)',
      '--chrome-bg': 'rgba(26, 22, 20, 0.76)',
      '--chrome-border': 'rgba(255, 238, 218, 0.12)',
      '--chrome-ink': '#f5ede2',
      '--chrome-muted': 'rgba(245, 237, 226, 0.72)',
      '--chrome-soft': 'rgba(255, 255, 255, 0.06)',
      '--panel-bg': 'rgba(30, 25, 23, 0.74)',
      '--panel-border': 'rgba(255, 239, 219, 0.12)',
      '--panel-ink': '#f3ecde',
      '--panel-muted': 'rgba(243, 236, 222, 0.72)',
      '--panel-kicker': '#d8a080',
      '--paper-100': '#f7f1e7',
      '--paper-200': '#efe6d8',
      '--surface-main': '#f7f1e7',
      '--surface-main-veil': 'rgba(255, 255, 255, 0.48)',
      '--surface-raised': '#fffaf0',
      '--surface-subtle': '#f2e8da',
      '--surface-soft': '#fcf7ee',
      '--surface-figure': '#ece0cf',
      '--surface-code': '#1c2128',
      '--surface-callout': '#fff6eb',
      '--surface-table-head': '#efe1cf',
      '--surface-table-row': 'rgba(255, 255, 255, 0.44)',
      '--ink-950': '#201a16',
      '--ink-900': '#2a231d',
      '--heading-ink': '#1f1915',
      '--muted-500': '#6b6257',
      '--muted-700': '#4e453b',
      '--line-100': 'rgba(43, 34, 26, 0.09)',
      '--line-strong': 'rgba(43, 34, 26, 0.15)',
      '--accent-500': '#b35a40',
      '--accent-600': '#8e4533',
      '--accent-soft': 'rgba(179, 90, 64, 0.12)',
      '--accent-ghost': 'rgba(179, 90, 64, 0.09)',
      '--accent-border': 'rgba(179, 90, 64, 0.28)',
      '--accent-contrast': '#fff8f2',
      '--shadow-soft': '0 26px 72px rgba(14, 13, 16, 0.17)',
      '--shadow-crisp': '0 14px 30px rgba(28, 22, 18, 0.1)',
      '--lightbox-overlay': 'rgba(12, 13, 18, 0.82)',
      '--lightbox-surface': 'rgba(25, 23, 27, 0.94)',
      '--page-content-width': '1120px'
    },
    mermaid: {
      darkMode: false,
      themeVariables: {
        background: 'transparent',
        fontFamily:
          '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif',
        primaryColor: '#fffaf0',
        primaryTextColor: '#2a231d',
        primaryBorderColor: '#c4a185',
        secondaryColor: '#f5e8d8',
        tertiaryColor: '#eadbc9',
        lineColor: '#7b6658',
        clusterBkg: '#f7ecdf',
        clusterBorder: '#c7ac92',
        mainBkg: '#fffaf0',
        secondBkg: '#f3e4d3',
        tertiaryBkg: '#e9d6c3',
        edgeLabelBackground: '#f7f1e7',
        textColor: '#2a231d',
        noteBkgColor: '#fff3e4',
        noteTextColor: '#2a231d'
      }
    }
  },
  {
    id: 'sage-mist',
    label: '雾绿',
    tone: '浅豆绿',
    swatches: ['#eef2e7', '#7d9a74', '#243029'],
    vars: {
      '--body-backdrop-start': '#18201f',
      '--body-backdrop-mid': '#1b2422',
      '--body-backdrop-end': '#151b1a',
      '--body-backdrop-glow': 'rgba(128, 165, 138, 0.18)',
      '--chrome-bg': 'rgba(22, 29, 28, 0.76)',
      '--chrome-border': 'rgba(225, 238, 227, 0.13)',
      '--chrome-ink': '#eef4ec',
      '--chrome-muted': 'rgba(238, 244, 236, 0.72)',
      '--chrome-soft': 'rgba(255, 255, 255, 0.05)',
      '--panel-bg': 'rgba(24, 33, 31, 0.74)',
      '--panel-border': 'rgba(228, 240, 231, 0.12)',
      '--panel-ink': '#edf4ee',
      '--panel-muted': 'rgba(237, 244, 238, 0.72)',
      '--panel-kicker': '#a9c49c',
      '--paper-100': '#eef3eb',
      '--paper-200': '#e2eadf',
      '--surface-main': '#eef3eb',
      '--surface-main-veil': 'rgba(255, 255, 255, 0.44)',
      '--surface-raised': '#f7fbf4',
      '--surface-subtle': '#e3ebe0',
      '--surface-soft': '#f5f8f2',
      '--surface-figure': '#dde7db',
      '--surface-code': '#18221f',
      '--surface-callout': '#f3f8ef',
      '--surface-table-head': '#dbe7d7',
      '--surface-table-row': 'rgba(255, 255, 255, 0.38)',
      '--ink-950': '#1c2621',
      '--ink-900': '#253229',
      '--heading-ink': '#1d2822',
      '--muted-500': '#5a685e',
      '--muted-700': '#435146',
      '--line-100': 'rgba(33, 47, 40, 0.09)',
      '--line-strong': 'rgba(33, 47, 40, 0.15)',
      '--accent-500': '#6b8b5d',
      '--accent-600': '#4d6843',
      '--accent-soft': 'rgba(107, 139, 93, 0.12)',
      '--accent-ghost': 'rgba(107, 139, 93, 0.08)',
      '--accent-border': 'rgba(107, 139, 93, 0.26)',
      '--accent-contrast': '#f7fbf4',
      '--shadow-soft': '0 26px 72px rgba(12, 18, 16, 0.16)',
      '--shadow-crisp': '0 14px 30px rgba(24, 32, 28, 0.1)',
      '--lightbox-overlay': 'rgba(9, 15, 13, 0.8)',
      '--lightbox-surface': 'rgba(20, 29, 26, 0.95)',
      '--page-content-width': '1120px'
    },
    mermaid: {
      darkMode: false,
      themeVariables: {
        background: 'transparent',
        fontFamily:
          '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif',
        primaryColor: '#f7fbf4',
        primaryTextColor: '#243128',
        primaryBorderColor: '#92ac88',
        secondaryColor: '#e6eee2',
        tertiaryColor: '#d6e2d2',
        lineColor: '#60755e',
        clusterBkg: '#edf4ea',
        clusterBorder: '#9bb395',
        mainBkg: '#f7fbf4',
        secondBkg: '#e4ede0',
        tertiaryBkg: '#dce7d8',
        edgeLabelBackground: '#eef3eb',
        textColor: '#243128',
        noteBkgColor: '#f2f8ee',
        noteTextColor: '#243128'
      }
    }
  },
  {
    id: 'mist-blue',
    label: '雾蓝灰',
    tone: '灰蓝纸面',
    swatches: ['#eef2f5', '#8aa0b8', '#1f2933'],
    vars: {
      '--body-backdrop-start': '#171d25',
      '--body-backdrop-mid': '#1b222b',
      '--body-backdrop-end': '#131922',
      '--body-backdrop-glow': 'rgba(111, 143, 176, 0.18)',
      '--chrome-bg': 'rgba(20, 27, 36, 0.78)',
      '--chrome-border': 'rgba(228, 238, 245, 0.12)',
      '--chrome-ink': '#eff5fb',
      '--chrome-muted': 'rgba(239, 245, 251, 0.72)',
      '--chrome-soft': 'rgba(255, 255, 255, 0.05)',
      '--panel-bg': 'rgba(22, 31, 41, 0.76)',
      '--panel-border': 'rgba(229, 239, 247, 0.11)',
      '--panel-ink': '#eef4f9',
      '--panel-muted': 'rgba(238, 244, 249, 0.72)',
      '--panel-kicker': '#a7bdd2',
      '--paper-100': '#eef3f7',
      '--paper-200': '#e2e9ef',
      '--surface-main': '#eef3f7',
      '--surface-main-veil': 'rgba(255, 255, 255, 0.42)',
      '--surface-raised': '#f8fbff',
      '--surface-subtle': '#e4ebf3',
      '--surface-soft': '#f6f9fc',
      '--surface-figure': '#dee6ef',
      '--surface-code': '#18222d',
      '--surface-callout': '#f2f7fc',
      '--surface-table-head': '#dde7f2',
      '--surface-table-row': 'rgba(255, 255, 255, 0.38)',
      '--ink-950': '#1b2430',
      '--ink-900': '#263241',
      '--heading-ink': '#1d2630',
      '--muted-500': '#5d6a78',
      '--muted-700': '#46515f',
      '--line-100': 'rgba(34, 46, 60, 0.09)',
      '--line-strong': 'rgba(34, 46, 60, 0.15)',
      '--accent-500': '#58799d',
      '--accent-600': '#3e5c7f',
      '--accent-soft': 'rgba(88, 121, 157, 0.12)',
      '--accent-ghost': 'rgba(88, 121, 157, 0.08)',
      '--accent-border': 'rgba(88, 121, 157, 0.25)',
      '--accent-contrast': '#f6fbff',
      '--shadow-soft': '0 26px 72px rgba(11, 18, 24, 0.16)',
      '--shadow-crisp': '0 14px 30px rgba(23, 31, 40, 0.1)',
      '--lightbox-overlay': 'rgba(8, 14, 20, 0.82)',
      '--lightbox-surface': 'rgba(19, 27, 36, 0.95)',
      '--page-content-width': '1120px'
    },
    mermaid: {
      darkMode: false,
      themeVariables: {
        background: 'transparent',
        fontFamily:
          '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif',
        primaryColor: '#f8fbff',
        primaryTextColor: '#263241',
        primaryBorderColor: '#93abc2',
        secondaryColor: '#e5edf5',
        tertiaryColor: '#d6e1ee',
        lineColor: '#5f7287',
        clusterBkg: '#edf4fa',
        clusterBorder: '#97aec5',
        mainBkg: '#f8fbff',
        secondBkg: '#e7eef6',
        tertiaryBkg: '#d9e4ef',
        edgeLabelBackground: '#eef3f7',
        textColor: '#263241',
        noteBkgColor: '#f0f6fb',
        noteTextColor: '#263241'
      }
    }
  },
  {
    id: 'stone-sand',
    label: '浅砂岩',
    tone: '砂岩暖灰',
    swatches: ['#f2ede6', '#b29a80', '#26211d'],
    vars: {
      '--body-backdrop-start': '#1a1b20',
      '--body-backdrop-mid': '#201e1f',
      '--body-backdrop-end': '#161519',
      '--body-backdrop-glow': 'rgba(173, 141, 112, 0.18)',
      '--chrome-bg': 'rgba(28, 24, 22, 0.78)',
      '--chrome-border': 'rgba(238, 227, 214, 0.12)',
      '--chrome-ink': '#f4ecdf',
      '--chrome-muted': 'rgba(244, 236, 223, 0.72)',
      '--chrome-soft': 'rgba(255, 255, 255, 0.05)',
      '--panel-bg': 'rgba(31, 27, 24, 0.76)',
      '--panel-border': 'rgba(241, 230, 217, 0.12)',
      '--panel-ink': '#f3ecde',
      '--panel-muted': 'rgba(243, 236, 222, 0.72)',
      '--panel-kicker': '#d6b690',
      '--paper-100': '#f2ede6',
      '--paper-200': '#e8dfd3',
      '--surface-main': '#f2ede6',
      '--surface-main-veil': 'rgba(255, 255, 255, 0.42)',
      '--surface-raised': '#fbf7f1',
      '--surface-subtle': '#e7ddd0',
      '--surface-soft': '#f8f4ed',
      '--surface-figure': '#e0d3c3',
      '--surface-code': '#1d1f25',
      '--surface-callout': '#f9f2ea',
      '--surface-table-head': '#e6d7c4',
      '--surface-table-row': 'rgba(255, 255, 255, 0.4)',
      '--ink-950': '#221d18',
      '--ink-900': '#2c261f',
      '--heading-ink': '#211b15',
      '--muted-500': '#6b6258',
      '--muted-700': '#50473d',
      '--line-100': 'rgba(44, 34, 25, 0.09)',
      '--line-strong': 'rgba(44, 34, 25, 0.15)',
      '--accent-500': '#9d7d5c',
      '--accent-600': '#7c6045',
      '--accent-soft': 'rgba(157, 125, 92, 0.12)',
      '--accent-ghost': 'rgba(157, 125, 92, 0.08)',
      '--accent-border': 'rgba(157, 125, 92, 0.26)',
      '--accent-contrast': '#fdf8f1',
      '--shadow-soft': '0 26px 72px rgba(18, 16, 15, 0.16)',
      '--shadow-crisp': '0 14px 30px rgba(31, 28, 24, 0.1)',
      '--lightbox-overlay': 'rgba(12, 11, 12, 0.82)',
      '--lightbox-surface': 'rgba(28, 24, 25, 0.95)',
      '--page-content-width': '1120px'
    },
    mermaid: {
      darkMode: false,
      themeVariables: {
        background: 'transparent',
        fontFamily:
          '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif',
        primaryColor: '#fbf7f1',
        primaryTextColor: '#2c261f',
        primaryBorderColor: '#bb9e82',
        secondaryColor: '#ece1d5',
        tertiaryColor: '#dfcfbe',
        lineColor: '#756557',
        clusterBkg: '#f0e6da',
        clusterBorder: '#c1a68a',
        mainBkg: '#fbf7f1',
        secondBkg: '#ede1d5',
        tertiaryBkg: '#e1d1c0',
        edgeLabelBackground: '#f2ede6',
        textColor: '#2c261f',
        noteBkgColor: '#f9f0e5',
        noteTextColor: '#2c261f'
      }
    }
  },
  {
    id: 'night-ink',
    label: '夜墨',
    tone: '深色夜读',
    swatches: ['#111821', '#4c6685', '#e7eef7'],
    vars: {
      '--body-backdrop-start': '#0d1218',
      '--body-backdrop-mid': '#111821',
      '--body-backdrop-end': '#0a1016',
      '--body-backdrop-glow': 'rgba(83, 116, 155, 0.18)',
      '--chrome-bg': 'rgba(14, 19, 26, 0.86)',
      '--chrome-border': 'rgba(163, 183, 209, 0.16)',
      '--chrome-ink': '#edf3fb',
      '--chrome-muted': 'rgba(237, 243, 251, 0.72)',
      '--chrome-soft': 'rgba(255, 255, 255, 0.06)',
      '--panel-bg': 'rgba(16, 22, 30, 0.82)',
      '--panel-border': 'rgba(169, 188, 213, 0.14)',
      '--panel-ink': '#e7eef7',
      '--panel-muted': 'rgba(231, 238, 247, 0.72)',
      '--panel-kicker': '#95aed0',
      '--paper-100': '#121922',
      '--paper-200': '#18212c',
      '--surface-main': '#111821',
      '--surface-main-veil': 'rgba(255, 255, 255, 0.02)',
      '--surface-raised': '#18212d',
      '--surface-subtle': '#1d2834',
      '--surface-soft': '#15202a',
      '--surface-figure': '#1d2935',
      '--surface-code': '#0c1218',
      '--surface-callout': '#182430',
      '--surface-table-head': '#1c2a37',
      '--surface-table-row': 'rgba(255, 255, 255, 0.01)',
      '--ink-950': '#edf3fb',
      '--ink-900': '#dce6f1',
      '--heading-ink': '#f4f8fc',
      '--muted-500': '#a2b1c0',
      '--muted-700': '#c6d3df',
      '--line-100': 'rgba(205, 221, 238, 0.11)',
      '--line-strong': 'rgba(205, 221, 238, 0.18)',
      '--accent-500': '#7f9fc5',
      '--accent-600': '#a8bfdb',
      '--accent-soft': 'rgba(127, 159, 197, 0.16)',
      '--accent-ghost': 'rgba(127, 159, 197, 0.11)',
      '--accent-border': 'rgba(127, 159, 197, 0.32)',
      '--accent-contrast': '#081018',
      '--shadow-soft': '0 28px 84px rgba(0, 0, 0, 0.32)',
      '--shadow-crisp': '0 14px 30px rgba(0, 0, 0, 0.24)',
      '--lightbox-overlay': 'rgba(4, 8, 12, 0.86)',
      '--lightbox-surface': 'rgba(12, 18, 24, 0.96)',
      '--page-content-width': '1120px'
    },
    mermaid: {
      darkMode: true,
      themeVariables: {
        background: 'transparent',
        fontFamily:
          '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif',
        primaryColor: '#1a2430',
        primaryTextColor: '#eef3fb',
        primaryBorderColor: '#6f8dab',
        secondaryColor: '#15202a',
        tertiaryColor: '#101821',
        lineColor: '#93acc5',
        clusterBkg: '#16212b',
        clusterBorder: '#58738e',
        mainBkg: '#1a2430',
        secondBkg: '#15202a',
        tertiaryBkg: '#101821',
        edgeLabelBackground: '#111821',
        textColor: '#eef3fb',
        noteBkgColor: '#1a2633',
        noteTextColor: '#eef3fb'
      }
    }
  }
];

const themeById = new Map<ThemeId, ThemePreset>(THEME_PRESETS.map((theme) => [theme.id, theme]));
const fontScaleById = new Map<FontScaleId, FontScalePreset>(FONT_SCALE_PRESETS.map((scale) => [scale.id, scale]));

export function readAppearance(): AppearanceState {
  try {
    const raw = window.localStorage.getItem(APPEARANCE_KEY);
    if (!raw) {
      return DEFAULT_APPEARANCE;
    }

    const parsed = JSON.parse(raw);
    const themeId = themeById.has(parsed?.themeId) ? parsed.themeId : DEFAULT_APPEARANCE.themeId;
    const fontScale = fontScaleById.has(parsed?.fontScale) ? parsed.fontScale : DEFAULT_APPEARANCE.fontScale;

    return { themeId, fontScale };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function writeAppearance(appearance: AppearanceState) {
  window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance));
}

export function getThemePreset(themeId: ThemeId) {
  return themeById.get(themeId) ?? themeById.get(DEFAULT_APPEARANCE.themeId)!;
}

export function getFontScalePreset(fontScale: FontScaleId) {
  return fontScaleById.get(fontScale) ?? fontScaleById.get(DEFAULT_APPEARANCE.fontScale)!;
}

export function buildAppearanceVars(appearance: AppearanceState): CSSProperties & { [key: `--${string}`]: string } {
  const theme = getThemePreset(appearance.themeId);
  const fontScale = getFontScalePreset(appearance.fontScale);

  return {
    ...theme.vars,
    ...fontScale.vars
  };
}

export function getMermaidTheme(themeId: ThemeId) {
  return getThemePreset(themeId).mermaid;
}
