export type ThemeId = 'cloud' | 'mist' | 'sand' | 'night' | 'obsidian';
export type FontScaleId = 'compact' | 'standard' | 'large';

export interface MermaidThemeConfig {
  darkMode: boolean;
  themeVariables: Record<string, string>;
}

export interface SiteThemeDefinition {
  id: ThemeId;
  label: string;
  description: string;
  accent: string;
  mermaid: MermaidThemeConfig;
}

export interface FontScaleOption {
  id: FontScaleId;
  label: string;
  description: string;
}

const SHARED_THEME_VARIABLES = {
  background: 'transparent',
  fontSize: '14px',
  fontFamily: '"PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif'
};

export const SITE_THEMES: Record<ThemeId, SiteThemeDefinition> = {
  cloud: {
    id: 'cloud',
    label: '云海蓝',
    description: '冷白底上的深蓝层级，适合作品方案、页面设计与架构阅读。',
    accent: '#3b82f6',
    mermaid: {
      darkMode: false,
      themeVariables: {
        ...SHARED_THEME_VARIABLES,
        primaryColor: '#f5f9ff',
        primaryTextColor: '#17325e',
        primaryBorderColor: '#9ab9ee',
        secondaryColor: '#e9f3ff',
        tertiaryColor: '#dcecff',
        lineColor: '#6f90c8',
        clusterBkg: '#eef5ff',
        clusterBorder: '#a8c3f2',
        mainBkg: '#f6fbff',
        secondBkg: '#e8f2ff',
        tertiaryBkg: '#deebff',
        edgeLabelBackground: '#f6fbff',
        textColor: '#20365a',
        noteBkgColor: '#f2f8ff',
        noteTextColor: '#20365a'
      }
    }
  },
  mist: {
    id: 'mist',
    label: '松雾青',
    description: '更安静的青绿灰调，适合长时间阅读与导航浏览。',
    accent: '#2f9a8f',
    mermaid: {
      darkMode: false,
      themeVariables: {
        ...SHARED_THEME_VARIABLES,
        primaryColor: '#f3fbf9',
        primaryTextColor: '#163c39',
        primaryBorderColor: '#8ac9be',
        secondaryColor: '#e4f6f1',
        tertiaryColor: '#d4efe7',
        lineColor: '#5c8e87',
        clusterBkg: '#edf8f5',
        clusterBorder: '#a6d7cd',
        mainBkg: '#f7fcfb',
        secondBkg: '#e7f6f1',
        tertiaryBkg: '#d9f0ea',
        edgeLabelBackground: '#f5fbf9',
        textColor: '#1d4d48',
        noteBkgColor: '#eef9f6',
        noteTextColor: '#1d4d48'
      }
    }
  },
  sand: {
    id: 'sand',
    label: '暖砂米',
    description: '米白与暖棕配色，适合资料归档与叙事性页面。',
    accent: '#c37738',
    mermaid: {
      darkMode: false,
      themeVariables: {
        ...SHARED_THEME_VARIABLES,
        primaryColor: '#fff8f0',
        primaryTextColor: '#573620',
        primaryBorderColor: '#e0b286',
        secondaryColor: '#f8efe1',
        tertiaryColor: '#f3e4d0',
        lineColor: '#9c6e47',
        clusterBkg: '#f9f1e6',
        clusterBorder: '#e7c8a4',
        mainBkg: '#fffbf6',
        secondBkg: '#f7efe3',
        tertiaryBkg: '#f2e4d2',
        edgeLabelBackground: '#fffaf4',
        textColor: '#5d3b24',
        noteBkgColor: '#fbf4ea',
        noteTextColor: '#5d3b24'
      }
    }
  },
  night: {
    id: 'night',
    label: '深海夜',
    description: '高对比深蓝夜色，适合长时间阅读与深色环境展示。',
    accent: '#7aa2ff',
    mermaid: {
      darkMode: true,
      themeVariables: {
        ...SHARED_THEME_VARIABLES,
        primaryColor: '#162238',
        primaryTextColor: '#f5f8ff',
        primaryBorderColor: '#7aa2ff',
        secondaryColor: '#1a2944',
        tertiaryColor: '#22365a',
        lineColor: '#9ab7ff',
        clusterBkg: '#132137',
        clusterBorder: '#7aa2ff',
        mainBkg: '#0f1a2c',
        secondBkg: '#1a2944',
        tertiaryBkg: '#22365a',
        edgeLabelBackground: '#101d31',
        textColor: '#eef4ff',
        noteBkgColor: '#182947',
        noteTextColor: '#eef4ff'
      }
    }
  },
  obsidian: {
    id: 'obsidian',
    label: '曜石黑',
    description: '近黑底与高亮青蓝描边，适合投屏和高对比阅读。',
    accent: '#72d6ff',
    mermaid: {
      darkMode: true,
      themeVariables: {
        ...SHARED_THEME_VARIABLES,
        primaryColor: '#16181d',
        primaryTextColor: '#f7fbff',
        primaryBorderColor: '#72d6ff',
        secondaryColor: '#1e232b',
        tertiaryColor: '#26303a',
        lineColor: '#9ce5ff',
        clusterBkg: '#14181f',
        clusterBorder: '#72d6ff',
        mainBkg: '#101319',
        secondBkg: '#1b2129',
        tertiaryBkg: '#242c35',
        edgeLabelBackground: '#11161d',
        textColor: '#f4fbff',
        noteBkgColor: '#1d242d',
        noteTextColor: '#f4fbff'
      }
    }
  }
};

export const DEFAULT_THEME: ThemeId = 'cloud';
export const DEFAULT_FONT_SCALE: FontScaleId = 'standard';

export const THEME_OPTIONS = Object.values(SITE_THEMES);
export const FONT_SCALE_OPTIONS: FontScaleOption[] = [
  {
    id: 'compact',
    label: '紧凑',
    description: '更高信息密度，适合长目录和连续查阅。'
  },
  {
    id: 'standard',
    label: '标准',
    description: '默认阅读密度，正文与侧栏层级最平衡。'
  },
  {
    id: 'large',
    label: '放大',
    description: '整体字号更舒展，适合投屏和远距离阅读。'
  }
];

export function getMermaidTheme(themeId: ThemeId = DEFAULT_THEME) {
  return SITE_THEMES[themeId].mermaid;
}
