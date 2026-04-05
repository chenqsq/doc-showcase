import { type CSSProperties, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  buildAppearanceVars,
  FONT_SCALE_PRESETS,
  getThemePreset,
  readAppearance,
  THEME_PRESETS,
  type AppearanceState,
  type FontScaleId,
  type ThemeId,
  writeAppearance
} from './appearance';
import {
  catalogById,
  catalogByPath,
  extractOutline,
  getRelatedResources,
  mathCatalog,
  mathFeaturedResources,
  navigableCatalog,
  platformCatalog,
  platformFeaturedResources,
  searchCatalog
} from './catalog';
import { MarkdownArticle } from './components/MarkdownArticle';
import { PdfViewer } from './components/PdfViewer';
import { ZoomLightbox } from './components/ZoomLightbox';
import type { CatalogItem, DocumentPriority, LightboxState, NavigationScopeKey, ResourceCollection, ResourceRole } from './types';

const RECENT_KEY = 'doc-showcase-recent';
const HEADER_FALLBACK_HEIGHT = 100;
const MATH_PRIORITY_MODULES = new Set(['00', 'R', 'T']);
type MobilePanel = 'closed' | 'catalog' | 'context' | 'appearance';
type CollectionFilter = 'all' | ResourceCollection;

type ShellStyle = CSSProperties & {
  [key: `--${string}`]: string;
};

interface CatalogSection {
  id: string;
  label: string;
  kicker: string;
  count: number;
  items: CatalogItem[];
  defaultOpen: boolean;
}

interface LibraryBlock {
  id: string;
  kicker: string;
  title: string;
  description: string;
  sections: CatalogSection[];
}

interface LandingDocLinkConfig {
  path: string;
  label: string;
}

interface LandingStatConfig {
  label: string;
  value: string;
  detail: string;
}

interface LandingOverviewBlockConfig {
  id: string;
  kicker: string;
  title: string;
  description: string;
  className: string;
  actionLabel: string;
  actionKind: 'route' | 'read';
  actionTarget: string;
  quickLinks?: LandingDocLinkConfig[];
  stats?: LandingStatConfig[];
  footnote?: string;
}

interface ResolvedLandingDocLinkConfig extends LandingDocLinkConfig {
  item: CatalogItem;
}

interface ScopeGroupDefinition {
  id: string;
  label: string;
  kicker: string;
  paths: string[];
  defaultOpen: boolean;
}

interface SidebarBackLink {
  label: string;
  to: string;
}

interface ScopeGroupMeta {
  id: string;
  label: string;
  kicker: string;
  order: number;
  defaultOpen: boolean;
}

interface NavigationScopeConfig {
  key: NavigationScopeKey;
  collection: ResourceCollection;
  title: string;
  kicker: string;
  backLink: SidebarBackLink;
  searchPlaceholder: string;
  emptyState: string;
  allPaths: string[];
  visibleGroups: ScopeGroupDefinition[];
  resolveGroup: (item: CatalogItem) => ScopeGroupMeta;
}

interface ResolvedLandingOverviewBlockConfig extends Omit<LandingOverviewBlockConfig, 'quickLinks'> {
  actionHref: string;
  quickLinks: ResolvedLandingDocLinkConfig[];
}

const READING_MAP_PATH = 'doc/智能体文档/00-项目阅读地图.md';
const DOC_INDEX_PATH = 'doc/智能体文档/00-文档总索引.md';

const PLATFORM_GUIDE_PATH = 'doc/智能体文档/平台层/平台总纲与架构.md';
const PLATFORM_PRODUCT_PATH = 'doc/智能体文档/平台层/AI主导学习平台-产品总纲.md';
const PLATFORM_ARCHITECTURE_PATH = 'doc/智能体文档/平台层/AI主导学习平台-总体架构设计.md';
const PLATFORM_REQUIREMENTS_PATH = 'doc/智能体文档/平台层/AI主导学习平台-平台需求与验收.md';
const PLATFORM_OBJECT_CONTRACT_PATH = 'doc/智能体文档/平台层/AI主导学习平台-统一对象与接口契约.md';
const PLATFORM_KNOWLEDGE_STRUCTURE_PATH = 'doc/智能体文档/平台层/AI主导学习平台-知识库结构与契约.md';
const PLATFORM_KNOWLEDGE_PROMPTS_PATH = 'doc/智能体文档/平台层/AI主导学习平台-知识库建设与提示词规范.md';
const PLATFORM_LIFECYCLE_PATH = 'doc/智能体文档/平台层/AI主导学习平台-学习生命周期与编排策略.md';
const PLATFORM_SUBJECT_ACCESS_PATH = 'doc/智能体文档/平台层/AI主导学习平台-学科大类与接入规范.md';
const PLATFORM_ROLE_MAP_PATH = 'doc/智能体文档/平台层/AI主导学习平台-角色主线与阶段地图.md';
const TEAM_OVERVIEW_PATH = 'doc/智能体文档/平台层/AI主导学习平台-团队协作与分工.md';
const TEAM_PROJECT_LEAD_PATH = 'doc/智能体文档/平台层/团队协作与分工/项目负责人-职责与执行手册.md';
const TEAM_KNOWLEDGE_LEAD_PATH = 'doc/智能体文档/平台层/团队协作与分工/OCR与资料电子化负责人-职责与执行手册.md';
const TEAM_WORKFLOW_LEAD_PATH = 'doc/智能体文档/平台层/团队协作与分工/工作流与联调负责人-职责与执行手册.md';

const ENGINE_GUIDE_PATH = 'doc/智能体文档/子引擎层/AI教师子引擎总览与设计.md';
const ENGINE_PRD_PATH = 'doc/智能体文档/子引擎层/AI教师子引擎-PRD.md';
const ENGINE_TECH_PATH = 'doc/智能体文档/子引擎层/AI教师子引擎-技术方案.md';
const ENGINE_STRATEGY_PATH = 'doc/智能体文档/子引擎层/AI教师子引擎-教学策略设计.md';
const ENGINE_WORKFLOW_PATH = 'doc/智能体文档/子引擎层/AI教师子引擎-Agent工作流联调与验收手册.md';
const ENGINE_APPENDIX_P0_PATH = 'doc/智能体文档/子引擎层/实施附录/01-P0-Multi-Agent学生主闭环-架构设计.md';
const ENGINE_APPENDIX_P1_PATH = 'doc/智能体文档/子引擎层/实施附录/02-P1-可视化与教师运营-架构设计.md';
const ENGINE_APPENDIX_P2_PATH = 'doc/智能体文档/子引擎层/实施附录/03-P2-外部接入与产品后端-架构设计.md';

const SUBJECT_GUIDE_PATH = 'doc/智能体文档/学科层/高等数学接入与知识库总览.md';
const SUBJECT_PLATFORM_DEMO_PATH = 'doc/智能体文档/学科层/高等数学-平台接入示范.md';
const SUBJECT_KNOWLEDGE_SPEC_PATH = 'doc/智能体文档/学科层/高等数学-知识库接入与落库方案.md';
const SUBJECT_PROMPT_SPEC_PATH = 'doc/智能体文档/学科层/高等数学-Agent提示词模板与分层教学规范.md';
const SUBJECT_ADP_PATH = 'doc/智能体文档/学科层/高等数学-ADP配置手册.md';
const SUBJECT_TEMPLATE_PATH = 'doc/智能体文档/学科层/学科接入模板.md';

const DELIVERY_GUIDE_PATH = 'doc/智能体文档/交付层/比赛交付与答辩手册.md';
const DELIVERY_ALIGNMENT_PATH = 'doc/智能体文档/交付层/比赛对齐说明.md';
const DELIVERY_SCRIPT_PATH = 'doc/智能体文档/交付层/答辩口径与演示脚本.md';

const MATH_COURSE_MAP_PATH =
  'kb/高等数学_测试/00-课程总览/高等数学_测试-00课程总览-CH00整门课程-课程总览-高数_测试全景地图.md';
const MATH_ROADMAP_PATH =
  'kb/高等数学_测试/00-课程总览/高等数学_测试-00课程总览-CH00整门课程-章节导学-学习路径说明.md';

const PROJECT_START_PATHS = [READING_MAP_PATH, DOC_INDEX_PATH] as const;
const PLATFORM_CORE_PATHS = [PLATFORM_GUIDE_PATH, PLATFORM_PRODUCT_PATH, PLATFORM_ARCHITECTURE_PATH, PLATFORM_REQUIREMENTS_PATH] as const;
const PLATFORM_SPEC_PATHS = [
  PLATFORM_OBJECT_CONTRACT_PATH,
  PLATFORM_KNOWLEDGE_STRUCTURE_PATH,
  PLATFORM_KNOWLEDGE_PROMPTS_PATH,
  PLATFORM_LIFECYCLE_PATH,
  PLATFORM_SUBJECT_ACCESS_PATH,
  PLATFORM_ROLE_MAP_PATH
] as const;
const ENGINE_IMPLEMENTATION_PATHS = [
  ENGINE_GUIDE_PATH,
  ENGINE_PRD_PATH,
  ENGINE_TECH_PATH,
  ENGINE_STRATEGY_PATH,
  ENGINE_WORKFLOW_PATH,
  ENGINE_APPENDIX_P0_PATH,
  ENGINE_APPENDIX_P1_PATH,
  ENGINE_APPENDIX_P2_PATH
] as const;
const SUBJECT_DEMO_PATHS = [
  SUBJECT_GUIDE_PATH,
  SUBJECT_PLATFORM_DEMO_PATH,
  SUBJECT_KNOWLEDGE_SPEC_PATH,
  SUBJECT_PROMPT_SPEC_PATH,
  SUBJECT_ADP_PATH,
  SUBJECT_TEMPLATE_PATH
] as const;
const TEAM_DELIVERY_REFERENCE_PATHS = [
  'doc/比赛资料/2026年广东省大学生计算机设计大赛-教育智能体应用创新赛.pdf',
  'doc/比赛资料/2026年广东省大学生计算机设计大赛教育智能体应用创新赛指南 .pdf',
  'doc/比赛资料/比赛.txt',
  'doc/腾讯平台使用文档/腾讯云ADP-Multi-Agent版AI教师智能体从0到1新手闭环指南.md',
  'doc/腾讯平台使用文档/腾讯云ADP-Multi-Agent版AI教师智能体从0到1新手闭环指南.pdf',
  'doc/腾讯平台使用文档/快速入门.pdf',
  'doc/腾讯平台使用文档/产品文档.pdf',
  'doc/腾讯平台使用文档/常见问题.pdf',
  'doc/腾讯平台使用文档/应用接口文档.pdf',
  'CLAW_CODE_ANALYSIS_REPORT.md'
] as const;
const TEAM_DELIVERY_PATHS = [
  DELIVERY_GUIDE_PATH,
  TEAM_OVERVIEW_PATH,
  TEAM_PROJECT_LEAD_PATH,
  TEAM_KNOWLEDGE_LEAD_PATH,
  TEAM_WORKFLOW_LEAD_PATH,
  DELIVERY_ALIGNMENT_PATH,
  DELIVERY_SCRIPT_PATH,
  ...TEAM_DELIVERY_REFERENCE_PATHS
] as const;
const ARCHIVE_PATHS = [
  'doc/智能体文档/归档/2026-03-31-平台主导重构前/00-架构总览-AI教师版.md',
  'doc/智能体文档/归档/2026-03-31-精简重构前/AI教师prd.md',
  'doc/智能体文档/归档/2026-03-31-精简重构前/技术方案-AI教师版.md',
  'doc/智能体文档/归档/2026-03-31-精简重构前/架构设计/00-架构总览-AI教师版.md',
  'doc/智能体文档/归档/2026-03-31-精简重构前/架构设计/01-P0-Multi-Agent学生主闭环-架构设计.md',
  'doc/智能体文档/归档/2026-03-31-精简重构前/架构设计/02-P1-可视化与教师运营-架构设计.md',
  'doc/智能体文档/归档/2026-03-31-精简重构前/架构设计/03-P2-外部接入与产品后端-架构设计.md'
] as const;

const MAIN_DOC_PATHS = new Set<string>([
  ...PROJECT_START_PATHS,
  ...PLATFORM_CORE_PATHS,
  ...PLATFORM_SPEC_PATHS,
  ENGINE_GUIDE_PATH,
  ENGINE_PRD_PATH,
  ENGINE_TECH_PATH,
  ENGINE_STRATEGY_PATH,
  ENGINE_WORKFLOW_PATH,
  ...SUBJECT_DEMO_PATHS,
  DELIVERY_GUIDE_PATH,
  TEAM_OVERVIEW_PATH,
  DELIVERY_ALIGNMENT_PATH,
  DELIVERY_SCRIPT_PATH
]);
const SUPPORT_DOC_PATHS = new Set<string>([
  TEAM_PROJECT_LEAD_PATH,
  TEAM_KNOWLEDGE_LEAD_PATH,
  TEAM_WORKFLOW_LEAD_PATH,
  ...TEAM_DELIVERY_REFERENCE_PATHS
]);
const APPENDIX_DOC_PATHS = new Set<string>([ENGINE_APPENDIX_P0_PATH, ENGINE_APPENDIX_P1_PATH, ENGINE_APPENDIX_P2_PATH]);
const PROJECT_START_PATH_SET = new Set<string>(PROJECT_START_PATHS);
const PLATFORM_CORE_PATH_SET = new Set<string>(PLATFORM_CORE_PATHS);
const PLATFORM_SPEC_PATH_SET = new Set<string>(PLATFORM_SPEC_PATHS);
const ENGINE_IMPLEMENTATION_PATH_SET = new Set<string>(ENGINE_IMPLEMENTATION_PATHS);
const SUBJECT_DEMO_PATH_SET = new Set<string>(SUBJECT_DEMO_PATHS);
const TEAM_DELIVERY_PATH_SET = new Set<string>(TEAM_DELIVERY_PATHS);
const TEAM_DELIVERY_REFERENCE_PATH_SET = new Set<string>(TEAM_DELIVERY_REFERENCE_PATHS);
const ARCHIVE_PATH_SET = new Set<string>(ARCHIVE_PATHS);

const LANDING_OVERVIEW_BLOCKS: LandingOverviewBlockConfig[] = [
  {
    id: 'start',
    kicker: '项目入口',
    title: '先读项目',
    description: '先看阅读地图和总索引，快速知道现在有哪些导读页，以及架构、需求、PRD、技术方案分别该去哪里看。',
    className: 'overview-panel--start',
    actionLabel: '打开阅读地图',
    actionKind: 'read',
    actionTarget: READING_MAP_PATH,
    quickLinks: [
      {
        path: DOC_INDEX_PATH,
        label: '文档总索引'
      },
      {
        path: TEAM_OVERVIEW_PATH,
        label: '团队协作与分工'
      }
    ],
    footnote: '导读层只负责找路，原始开发文档已经重新回到主路径里。'
  },
  {
    id: 'platform',
    kicker: '平台设计',
    title: '平台设计',
    description: '先看平台导读，再进入产品总纲、总体架构设计、平台需求与验收和一整组平台规范文档。',
    className: 'overview-panel--platform',
    actionLabel: '查看平台总纲',
    actionKind: 'read',
    actionTarget: PLATFORM_GUIDE_PATH,
    quickLinks: [
      {
        path: PLATFORM_PRODUCT_PATH,
        label: '产品总纲'
      },
      {
        path: PLATFORM_ARCHITECTURE_PATH,
        label: '总体架构设计'
      }
    ],
    footnote: '适合先抓平台主线，再下钻对象契约、知识库规范和生命周期。'
  },
  {
    id: 'workflow',
    kicker: '实现主线',
    title: '子引擎实现',
    description: '导读页只告诉你怎么找路，真正开发还是回到 PRD、技术方案、联调手册和 P0-P2 实施附录。',
    className: 'overview-panel--workflow',
    actionLabel: '查看子引擎总览',
    actionKind: 'read',
    actionTarget: ENGINE_GUIDE_PATH,
    quickLinks: [
      {
        path: ENGINE_PRD_PATH,
        label: 'AI教师子引擎 PRD'
      },
      {
        path: ENGINE_TECH_PATH,
        label: 'AI教师子引擎技术方案'
      }
    ],
    footnote: '联调手册和 3 份实施附录也都保留，适合实现者按真实开发链路推进。'
  },
  {
    id: 'subject',
    kicker: '高数示例',
    title: '高数示例',
    description: '高数导读页负责告诉你怎么读；真正的接入示范、落库规范、提示词规范和 ADP 配置都继续保留。',
    className: 'overview-panel--subject',
    actionLabel: '查看高数接入',
    actionKind: 'read',
    actionTarget: SUBJECT_GUIDE_PATH,
    quickLinks: [
      {
        path: SUBJECT_PLATFORM_DEMO_PATH,
        label: '高等数学平台接入示范'
      },
      {
        path: SUBJECT_KNOWLEDGE_SPEC_PATH,
        label: '高等数学落库规范'
      }
    ],
    footnote: '课程总览、课堂重构、教师运营和各模块知识卡继续作为知识资产层保留。'
  },
  {
    id: 'delivery',
    kicker: '团队与交付',
    title: '比赛交付',
    description: '比赛导读页负责收口展示路径，团队协作、岗位手册、对齐说明、答辩脚本和参考材料都并行保留。',
    className: 'overview-panel--delivery',
    actionLabel: '打开比赛手册',
    actionKind: 'read',
    actionTarget: DELIVERY_GUIDE_PATH,
    quickLinks: [
      {
        path: TEAM_OVERVIEW_PATH,
        label: '团队协作与分工'
      },
      {
        path: DELIVERY_ALIGNMENT_PATH,
        label: '比赛对齐说明'
      }
    ],
    footnote: '赛题 PDF、腾讯平台资料和代码分析报告也都还在同一组里，方便临场查阅。'
  }
];

const NAVIGATION_SCOPES: Record<NavigationScopeKey, NavigationScopeConfig> = {
  'project-start': {
    key: 'project-start',
    collection: 'platform-docs',
    title: '先看',
    kicker: '当前分类',
    backLink: { label: '查看全部项目文档', to: '/platform' },
    searchPlaceholder: '搜索阅读地图或文档总索引',
    emptyState: '当前先看分类下没有命中内容。',
    allPaths: [...PROJECT_START_PATHS],
    visibleGroups: [
      {
        id: 'project-start',
        label: '项目入口',
        kicker: '先看',
        paths: [...PROJECT_START_PATHS],
        defaultOpen: true
      }
    ],
    resolveGroup: () => ({ id: 'project-start', label: '项目入口', kicker: '先看', order: 0, defaultOpen: true })
  },
  'platform-core': {
    key: 'platform-core',
    collection: 'platform-docs',
    title: '平台核心',
    kicker: '当前分类',
    backLink: { label: '查看全部项目文档', to: '/platform' },
    searchPlaceholder: '搜索平台导读、产品总纲、架构设计或需求文档',
    emptyState: '当前平台核心分类下没有命中内容。',
    allPaths: [...PLATFORM_CORE_PATHS],
    visibleGroups: [
      {
        id: 'platform-guide',
        label: '导读层',
        kicker: '平台核心',
        paths: [PLATFORM_GUIDE_PATH],
        defaultOpen: true
      },
      {
        id: 'platform-core-docs',
        label: '开发主文档',
        kicker: '平台核心',
        paths: [PLATFORM_PRODUCT_PATH, PLATFORM_ARCHITECTURE_PATH, PLATFORM_REQUIREMENTS_PATH],
        defaultOpen: true
      }
    ],
    resolveGroup: (item) =>
      item.relativePath === PLATFORM_GUIDE_PATH
        ? { id: 'platform-guide', label: '导读层', kicker: '平台核心', order: 0, defaultOpen: true }
        : { id: 'platform-core-docs', label: '开发主文档', kicker: '平台核心', order: 1, defaultOpen: true }
  },
  'platform-specs': {
    key: 'platform-specs',
    collection: 'platform-docs',
    title: '平台规范',
    kicker: '当前分类',
    backLink: { label: '查看全部项目文档', to: '/platform' },
    searchPlaceholder: '搜索对象契约、知识库规范、生命周期或扩科规则',
    emptyState: '当前平台规范分类下没有命中内容。',
    allPaths: [...PLATFORM_SPEC_PATHS],
    visibleGroups: [
      {
        id: 'platform-specs',
        label: '平台规范',
        kicker: '开发层',
        paths: [...PLATFORM_SPEC_PATHS],
        defaultOpen: true
      }
    ],
    resolveGroup: () => ({ id: 'platform-specs', label: '平台规范', kicker: '开发层', order: 0, defaultOpen: true })
  },
  'engine-implementation': {
    key: 'engine-implementation',
    collection: 'platform-docs',
    title: '子引擎开发',
    kicker: '当前分类',
    backLink: { label: '查看全部项目文档', to: '/platform' },
    searchPlaceholder: '搜索 PRD、技术方案、联调手册或实施附录',
    emptyState: '当前子引擎分类下没有命中内容。',
    allPaths: [...ENGINE_IMPLEMENTATION_PATHS],
    visibleGroups: [
      {
        id: 'engine-guide',
        label: '导读层',
        kicker: '子引擎',
        paths: [ENGINE_GUIDE_PATH],
        defaultOpen: true
      },
      {
        id: 'engine-design',
        label: '核心设计',
        kicker: '开发层',
        paths: [ENGINE_PRD_PATH, ENGINE_TECH_PATH, ENGINE_STRATEGY_PATH],
        defaultOpen: true
      },
      {
        id: 'engine-workflow',
        label: '联调与验收',
        kicker: '开发层',
        paths: [ENGINE_WORKFLOW_PATH],
        defaultOpen: true
      },
      {
        id: 'engine-appendix',
        label: '实施附录',
        kicker: '阶段补充',
        paths: [ENGINE_APPENDIX_P0_PATH, ENGINE_APPENDIX_P1_PATH, ENGINE_APPENDIX_P2_PATH],
        defaultOpen: true
      }
    ],
    resolveGroup: (item) =>
      item.relativePath === ENGINE_GUIDE_PATH
        ? { id: 'engine-guide', label: '导读层', kicker: '子引擎', order: 0, defaultOpen: true }
        : item.relativePath === ENGINE_WORKFLOW_PATH
          ? { id: 'engine-workflow', label: '联调与验收', kicker: '开发层', order: 2, defaultOpen: true }
          : APPENDIX_DOC_PATHS.has(item.relativePath)
            ? { id: 'engine-appendix', label: '实施附录', kicker: '阶段补充', order: 3, defaultOpen: true }
            : { id: 'engine-design', label: '核心设计', kicker: '开发层', order: 1, defaultOpen: true }
  },
  'subject-demo': {
    key: 'subject-demo',
    collection: 'platform-docs',
    title: '学科示例',
    kicker: '当前分类',
    backLink: { label: '查看高等数学知识库', to: '/math' },
    searchPlaceholder: '搜索高数导读、接入示范、落库规范或 ADP 配置',
    emptyState: '当前学科示例分类下没有命中内容。',
    allPaths: [...SUBJECT_DEMO_PATHS],
    visibleGroups: [
      {
        id: 'subject-guide',
        label: '导读层',
        kicker: '学科示例',
        paths: [SUBJECT_GUIDE_PATH],
        defaultOpen: true
      },
      {
        id: 'subject-implementation',
        label: '接入与落地',
        kicker: '开发层',
        paths: [SUBJECT_PLATFORM_DEMO_PATH, SUBJECT_KNOWLEDGE_SPEC_PATH],
        defaultOpen: true
      },
      {
        id: 'subject-config',
        label: '提示词与配置',
        kicker: '开发层',
        paths: [SUBJECT_PROMPT_SPEC_PATH, SUBJECT_ADP_PATH, SUBJECT_TEMPLATE_PATH],
        defaultOpen: true
      }
    ],
    resolveGroup: (item) =>
      item.relativePath === SUBJECT_GUIDE_PATH
        ? { id: 'subject-guide', label: '导读层', kicker: '学科示例', order: 0, defaultOpen: true }
        : item.relativePath === SUBJECT_PLATFORM_DEMO_PATH || item.relativePath === SUBJECT_KNOWLEDGE_SPEC_PATH
          ? { id: 'subject-implementation', label: '接入与落地', kicker: '开发层', order: 1, defaultOpen: true }
          : { id: 'subject-config', label: '提示词与配置', kicker: '开发层', order: 2, defaultOpen: true }
  },
  'team-delivery': {
    key: 'team-delivery',
    collection: 'platform-docs',
    title: '团队与交付',
    kicker: '当前分类',
    backLink: { label: '查看全部项目文档', to: '/platform' },
    searchPlaceholder: '搜索团队协作、岗位手册、比赛口径或参考资料',
    emptyState: '当前团队与交付分类下没有命中内容。',
    allPaths: [...TEAM_DELIVERY_PATHS],
    visibleGroups: [
      {
        id: 'delivery-guide',
        label: '导读层',
        kicker: '团队与交付',
        paths: [DELIVERY_GUIDE_PATH],
        defaultOpen: true
      },
      {
        id: 'team-docs',
        label: '团队协作',
        kicker: '开发层',
        paths: [TEAM_OVERVIEW_PATH, TEAM_PROJECT_LEAD_PATH, TEAM_KNOWLEDGE_LEAD_PATH, TEAM_WORKFLOW_LEAD_PATH],
        defaultOpen: true
      },
      {
        id: 'delivery-docs',
        label: '比赛交付',
        kicker: '开发层',
        paths: [DELIVERY_ALIGNMENT_PATH, DELIVERY_SCRIPT_PATH],
        defaultOpen: true
      },
      {
        id: 'delivery-reference',
        label: '参考资料',
        kicker: '答辩与参考',
        paths: [...TEAM_DELIVERY_REFERENCE_PATHS],
        defaultOpen: true
      }
    ],
    resolveGroup: (item) =>
      item.relativePath === DELIVERY_GUIDE_PATH
        ? { id: 'delivery-guide', label: '导读层', kicker: '团队与交付', order: 0, defaultOpen: true }
        : item.relativePath === TEAM_OVERVIEW_PATH ||
            item.relativePath === TEAM_PROJECT_LEAD_PATH ||
            item.relativePath === TEAM_KNOWLEDGE_LEAD_PATH ||
            item.relativePath === TEAM_WORKFLOW_LEAD_PATH
          ? { id: 'team-docs', label: '团队协作', kicker: '开发层', order: 1, defaultOpen: true }
          : item.relativePath === DELIVERY_ALIGNMENT_PATH || item.relativePath === DELIVERY_SCRIPT_PATH
            ? { id: 'delivery-docs', label: '比赛交付', kicker: '开发层', order: 2, defaultOpen: true }
            : { id: 'delivery-reference', label: '参考资料', kicker: '答辩与参考', order: 3, defaultOpen: true }
  },
  archive: {
    key: 'archive',
    collection: 'platform-docs',
    title: '归档',
    kicker: '当前分类',
    backLink: { label: '返回项目文档', to: '/platform' },
    searchPlaceholder: '搜索历史版本或旧架构稿',
    emptyState: '当前归档分类下没有命中内容。',
    allPaths: [...ARCHIVE_PATHS],
    visibleGroups: [
      {
        id: 'archive',
        label: '历史版本',
        kicker: '归档',
        paths: [...ARCHIVE_PATHS],
        defaultOpen: false
      }
    ],
    resolveGroup: () => ({ id: 'archive', label: '历史版本', kicker: '归档', order: 0, defaultOpen: false })
  }
};

function uniqueCatalogItems(items: CatalogItem[]): CatalogItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function getDocumentPriority(item: CatalogItem): DocumentPriority {
  if (item.layer === '归档') {
    return 'archive';
  }

  if (MAIN_DOC_PATHS.has(item.relativePath)) {
    return 'main';
  }

  if (SUPPORT_DOC_PATHS.has(item.relativePath)) {
    return 'support';
  }

  if (APPENDIX_DOC_PATHS.has(item.relativePath)) {
    return 'appendix';
  }

  return 'support';
}

function getDocumentPriorityLabel(priority: DocumentPriority): string {
  if (priority === 'main') {
    return '主文档';
  }
  if (priority === 'support') {
    return '补充文档';
  }
  if (priority === 'appendix') {
    return '附录';
  }
  return '归档';
}

function getDocumentPriorityRank(priority: DocumentPriority): number {
  if (priority === 'main') {
    return 0;
  }
  if (priority === 'support') {
    return 1;
  }
  if (priority === 'appendix') {
    return 2;
  }
  return 3;
}

function compareByPriorityThenTitle(a: CatalogItem, b: CatalogItem): number {
  const priorityDiff = getDocumentPriorityRank(getDocumentPriority(a)) - getDocumentPriorityRank(getDocumentPriority(b));
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  return a.title.localeCompare(b.title, 'zh-CN');
}

function getNavigationScope(item: CatalogItem): NavigationScopeKey | null {
  if (item.collection !== 'platform-docs') {
    return null;
  }

  if (item.layer === '归档' || ARCHIVE_PATH_SET.has(item.relativePath)) {
    return 'archive';
  }

  if (PROJECT_START_PATH_SET.has(item.relativePath)) {
    return 'project-start';
  }

  if (PLATFORM_CORE_PATH_SET.has(item.relativePath)) {
    return 'platform-core';
  }

  if (PLATFORM_SPEC_PATH_SET.has(item.relativePath)) {
    return 'platform-specs';
  }

  if (ENGINE_IMPLEMENTATION_PATH_SET.has(item.relativePath) || item.relativePath.startsWith('doc/智能体文档/子引擎层/')) {
    return 'engine-implementation';
  }

  if (SUBJECT_DEMO_PATH_SET.has(item.relativePath) || item.relativePath.startsWith('doc/智能体文档/学科层/')) {
    return 'subject-demo';
  }

  if (
    TEAM_DELIVERY_PATH_SET.has(item.relativePath) ||
    item.layer === '交付层' ||
    item.layer === '比赛资料' ||
    item.layer === '腾讯平台资料' ||
    item.layer === '技术参考'
  ) {
    return 'team-delivery';
  }

  return 'platform-specs';
}

function getScopeConfig(scope: NavigationScopeKey): NavigationScopeConfig {
  return NAVIGATION_SCOPES[scope];
}

function getScopeItems(scope: NavigationScopeKey): CatalogItem[] {
  return getScopeConfig(scope).allPaths
    .map((path) => catalogByPath.get(path))
    .filter((item): item is CatalogItem => Boolean(item));
}

function getVisibleScopeItems(scope: NavigationScopeKey): CatalogItem[] {
  return getScopeConfig(scope).visibleGroups
    .flatMap((group) => group.paths)
    .map((path) => catalogByPath.get(path))
    .filter((item): item is CatalogItem => Boolean(item));
}

function buildScopeSections(
  scope: NavigationScopeKey,
  items: CatalogItem[],
  activeItem: CatalogItem,
  isSearching: boolean
): CatalogSection[] {
  const config = getScopeConfig(scope);

  if (!isSearching) {
    const sections = config.visibleGroups
      .map((group) => ({
        id: `${scope}-${group.id}`,
        label: group.label,
        kicker: group.kicker,
        count: group.paths.length,
        items: group.paths
          .map((path) => catalogByPath.get(path))
          .filter((item): item is CatalogItem => Boolean(item)),
        defaultOpen: group.defaultOpen
      }))
      .filter((section) => section.items.length);

    const visibleIds = new Set(sections.flatMap((section) => section.items.map((item) => item.id)));

    if (!visibleIds.has(activeItem.id)) {
      sections.unshift({
        id: `${scope}-current`,
        label: '当前文档',
        kicker: '临时查看',
        count: 1,
        items: [activeItem],
        defaultOpen: true
      });
    }

    return sections;
  }

  const groups = new Map<string, { meta: ScopeGroupMeta; items: CatalogItem[] }>();

  items.forEach((item) => {
    const meta = config.resolveGroup(item);
    const current = groups.get(meta.id) ?? { meta, items: [] };
    current.items.push(item);
    groups.set(meta.id, current);
  });

  return [...groups.values()]
    .sort((a, b) => a.meta.order - b.meta.order)
    .map(({ meta, items: groupItems }) => ({
      id: `${scope}-${meta.id}`,
      label: meta.label,
      kicker: meta.kicker,
      count: groupItems.length,
      items: uniqueCatalogItems(groupItems).sort(compareByPriorityThenTitle),
      defaultOpen: true
    }));
}

function getScopedRelatedResources(item: CatalogItem, scope: NavigationScopeKey | null): CatalogItem[] {
  if (!scope) {
    return getRelatedResources(item).slice(0, 4);
  }

  const visibleIds = new Set(getVisibleScopeItems(scope).map((candidate) => candidate.id));
  const preferred = getRelatedResources(item)
    .filter((candidate) => visibleIds.has(candidate.id))
    .sort(compareByPriorityThenTitle);
  const fallback = getVisibleScopeItems(scope)
    .filter((candidate) => candidate.id !== item.id)
    .sort(compareByPriorityThenTitle);

  return uniqueCatalogItems([...preferred, ...fallback]).slice(0, 4);
}

function getCollectionPath(collection: ResourceCollection): '/math' | '/platform' {
  return collection === 'math-kb' ? '/math' : '/platform';
}

function getCollectionItems(collection: ResourceCollection): CatalogItem[] {
  return collection === 'math-kb' ? mathCatalog : platformCatalog;
}

function getCollectionSections(items: CatalogItem[], collection: ResourceCollection): CatalogSection[] {
  return collection === 'math-kb' ? buildMathSections(items) : buildPlatformSections(items);
}

function getCollectionSearchPlaceholder(collection: ResourceCollection): string {
  return collection === 'math-kb' ? '搜索导航文档、模块或知识资产' : '搜索主文档、参考资料或归档';
}

function getCollectionDescription(collection: ResourceCollection): string {
  return collection === 'math-kb'
    ? '先看课程总览与学习路径，再按模块进入知识资产；课堂重构和教师运营继续保留为高优先入口。'
    : '按导读层和开发层一起浏览：先读项目，再看平台核心、平台规范、子引擎开发、学科示例、团队与交付。';
}

function getCollectionHeroLabel(collection: ResourceCollection): string {
  return collection === 'math-kb' ? '高数示例' : '项目文档';
}

function getCollectionDisplayName(collection: ResourceCollection): string {
  return collection === 'math-kb' ? '高等数学知识库' : '项目文档体系';
}

function getCollectionDirectoryTitle(collection: ResourceCollection): string {
  return collection === 'math-kb' ? '知识库目录' : '阅读目录';
}

function buildCollectionCounts(items: CatalogItem[], collection: ResourceCollection): Array<{ label: string; count: number }> {
  const sections = getCollectionSections(items, collection);
  return sections.map((section) => ({
    label: collection === 'math-kb' ? `${section.kicker} ${section.label}` : section.label,
    count: section.count
  }));
}

function getMathModuleSort(moduleKey: string | null): number {
  if (!moduleKey) {
    return 999;
  }

  if (moduleKey === '00') {
    return 0;
  }

  if (/^M\d+$/.test(moduleKey)) {
    return Number(moduleKey.slice(1)) + 1;
  }

  if (moduleKey === 'R') {
    return 90;
  }

  if (moduleKey === 'T') {
    return 91;
  }

  return 999;
}

function getCollectionLabel(collection: CollectionFilter | ResourceCollection): string {
  if (collection === 'all') {
    return '全部公开资料';
  }

  return getCollectionDisplayName(collection);
}

function getRoleLabel(role: ResourceRole): string {
  if (role === 'student') {
    return '学生向';
  }
  if (role === 'teacher') {
    return '教师向';
  }
  return '通用';
}

function getItemMeta(item: CatalogItem): string {
  if (item.collection === 'math-kb') {
    return [item.moduleKey, item.resourceKind, item.role === 'unknown' ? null : getRoleLabel(item.role)].filter(Boolean).join(' · ');
  }

  return [item.layer, item.resourceKind].filter(Boolean).join(' · ');
}

function filterCatalogByCollection(items: CatalogItem[], collectionFilter: CollectionFilter): CatalogItem[] {
  if (collectionFilter === 'all') {
    return items;
  }

  return items.filter((item) => item.collection === collectionFilter);
}

function buildMathSections(items: CatalogItem[]): CatalogSection[] {
  const groups = new Map<string, CatalogItem[]>();
  const navigationMeta = new Map<
    string,
    {
      label: string;
      kicker: string;
      defaultOpen: boolean;
    }
  >([
    ['00', { label: '课程总览', kicker: '导航层', defaultOpen: true }],
    ['R', { label: '课堂重构', kicker: '导航层', defaultOpen: true }],
    ['T', { label: '教师运营', kicker: '导航层', defaultOpen: true }]
  ]);

  items.forEach((item) => {
    const key = item.moduleKey ?? item.group;
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  });

  return [...groups.entries()]
    .map(([moduleKey, groupItems]) => ({
      id: `math-${moduleKey}`,
      label: navigationMeta.get(moduleKey)?.label ?? groupItems[0]?.moduleLabel ?? groupItems[0]?.group ?? moduleKey,
      kicker: navigationMeta.get(moduleKey)?.kicker ?? '知识资产',
      count: groupItems.length,
      items: groupItems.sort((a, b) =>
        navigationMeta.has(moduleKey) ? compareByPriorityThenTitle(a, b) : a.title.localeCompare(b.title, 'zh-CN')
      ),
      defaultOpen: navigationMeta.get(moduleKey)?.defaultOpen ?? MATH_PRIORITY_MODULES.has(moduleKey)
    }))
    .sort((a, b) => getMathModuleSort(a.items[0]?.moduleKey ?? null) - getMathModuleSort(b.items[0]?.moduleKey ?? null));
}

function buildPlatformSections(items: CatalogItem[]): CatalogSection[] {
  const sectionDefinitions = [
    {
      id: 'project-start',
      label: '先看',
      kicker: '导读层',
      paths: [...PROJECT_START_PATHS],
      defaultOpen: true
    },
    {
      id: 'platform-core',
      label: '平台核心',
      kicker: '导读 + 主文档',
      paths: [...PLATFORM_CORE_PATHS],
      defaultOpen: true
    },
    {
      id: 'platform-specs',
      label: '平台规范',
      kicker: '开发层',
      paths: [...PLATFORM_SPEC_PATHS],
      defaultOpen: true
    },
    {
      id: 'engine-implementation',
      label: '子引擎开发',
      kicker: '开发层',
      paths: [...ENGINE_IMPLEMENTATION_PATHS],
      defaultOpen: true
    },
    {
      id: 'subject-demo',
      label: '学科示例',
      kicker: '开发层',
      paths: [...SUBJECT_DEMO_PATHS],
      defaultOpen: true
    },
    {
      id: 'team-delivery',
      label: '团队与交付',
      kicker: '收口区',
      paths: [...TEAM_DELIVERY_PATHS],
      defaultOpen: true
    },
    {
      id: 'archive',
      label: '归档',
      kicker: '历史版本',
      paths: [...ARCHIVE_PATHS],
      defaultOpen: false
    }
  ];

  return sectionDefinitions
    .map((section) => {
      const pathOrder = new Map<string, number>((section.paths as string[]).map((path, index) => [path, index]));
      const sectionItems = items
        .filter((item) => pathOrder.has(item.relativePath))
        .sort((a, b) => {
          const orderDiff = (pathOrder.get(a.relativePath) ?? Number.MAX_SAFE_INTEGER) - (pathOrder.get(b.relativePath) ?? Number.MAX_SAFE_INTEGER);
          if (orderDiff !== 0) {
            return orderDiff;
          }
          return compareByPriorityThenTitle(a, b);
        });

      if (!sectionItems.length) {
        return null;
      }

      return {
        id: `platform-${section.id}`,
        label: section.label,
        kicker: section.kicker,
        count: sectionItems.length,
        items: sectionItems,
        defaultOpen: section.defaultOpen
      };
    })
    .filter((section): section is CatalogSection => Boolean(section));
}

function buildCatalogSections(items: CatalogItem[], collectionFilter: CollectionFilter): CatalogSection[] {
  const mathItems = items.filter((item) => item.collection === 'math-kb');
  const platformItems = items.filter((item) => item.collection === 'platform-docs');

  if (collectionFilter === 'math-kb') {
    return buildMathSections(mathItems);
  }

  if (collectionFilter === 'platform-docs') {
    return buildPlatformSections(platformItems);
  }

  return [...buildMathSections(mathItems), ...buildPlatformSections(platformItems)];
}

function buildLibraryBlocks(items: CatalogItem[], collectionFilter: CollectionFilter): LibraryBlock[] {
  const blocks: LibraryBlock[] = [];
  const mathItems = items.filter((item) => item.collection === 'math-kb');
  const platformItems = items.filter((item) => item.collection === 'platform-docs');

  if (collectionFilter !== 'platform-docs' && mathItems.length) {
    blocks.push({
      id: 'math-kb',
      kicker: '知识库示例',
      title: getCollectionDisplayName('math-kb'),
      description: '按模块、资源类型和角色组织，适合课程地图展示、知识点查阅与样板演示。',
      sections: buildMathSections(mathItems)
    });
  }

  if (collectionFilter !== 'math-kb' && platformItems.length) {
    blocks.push({
      id: 'platform-docs',
      kicker: '平台文档',
      title: getCollectionDisplayName('platform-docs'),
      description: '导读层负责找路，开发层保留架构、需求、PRD、技术方案、团队文档和比赛材料。',
      sections: buildPlatformSections(platformItems)
    });
  }

  return blocks;
}

function readRecentIds(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeRecentIds(ids: string[]) {
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, 8)));
}

function App() {
  const [search, setSearch] = useState('');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('closed');
  const [mobileQuickNavOpen, setMobileQuickNavOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>(() => readRecentIds());
  const [appearance, setAppearance] = useState<AppearanceState>(() => readAppearance());
  const [headerHeight, setHeaderHeight] = useState(HEADER_FALLBACK_HEIGHT);
  const [headerCompressed, setHeaderCompressed] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const isHomeRoute = location.pathname === '/';
  const isCollectionRoute = location.pathname === '/math' || location.pathname === '/platform';
  const isReaderRoute = location.pathname.startsWith('/read/');

  useEffect(() => {
    setSearch('');
    setMobilePanel('closed');
    setMobileQuickNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const measureHeader = () => {
      setHeaderHeight(Math.round(header.getBoundingClientRect().height));
    };

    measureHeader();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureHeader();
    });

    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncHeaderShadow = () => {
      setHeaderCompressed(window.scrollY > 8);
    };

    syncHeaderShadow();
    window.addEventListener('scroll', syncHeaderShadow, { passive: true });
    return () => window.removeEventListener('scroll', syncHeaderShadow);
  }, []);

  useEffect(() => {
    writeAppearance(appearance);
  }, [appearance]);

  useEffect(() => {
    if (mobilePanel === 'closed') {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobilePanel('closed');
      }
    };

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobilePanel]);

  useEffect(() => {
    if (!mobileQuickNavOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileQuickNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileQuickNavOpen]);

  useEffect(() => {
    const syncResponsivePanels = () => {
      const width = window.innerWidth;

      setMobileQuickNavOpen((current) => (width < 960 ? current : false));
      setMobilePanel((current) => {
        if (current === 'closed') {
          return current;
        }

        if (current === 'context') {
          return width < 960 || (width >= 960 && width < 1280) ? current : 'closed';
        }

        return width < 960 ? current : 'closed';
      });
    };

    syncResponsivePanels();
    window.addEventListener('resize', syncResponsivePanels, { passive: true });
    return () => window.removeEventListener('resize', syncResponsivePanels);
  }, []);

  const recentItems = useMemo(
    () =>
      recentIds
        .map((id) => catalogById.get(id))
        .filter((item): item is CatalogItem => Boolean(item) && item?.type !== 'image'),
    [recentIds]
  );

  const rememberResource = useCallback((item: CatalogItem) => {
    setRecentIds((current) => {
      const next = [item.id, ...current.filter((id) => id !== item.id)].slice(0, 8);
      writeRecentIds(next);
      return next;
    });
  }, []);

  const shellStyle: ShellStyle = useMemo(
    () => ({
      ...buildAppearanceVars(appearance),
      '--shell-padding': '20px',
      '--frame-gap': '18px',
      '--header-height': `${headerHeight}px`,
      '--frame-sticky-top': 'calc(var(--shell-padding) + var(--header-height, 100px) + var(--frame-gap))'
    }),
    [appearance, headerHeight]
  );

  const toggleMobilePanel = useCallback((panel: Exclude<MobilePanel, 'closed'>) => {
    setMobileQuickNavOpen(false);
    setMobilePanel((current) => (current === panel ? 'closed' : panel));
  }, []);

  const closeMobilePanel = useCallback(() => {
    setMobilePanel('closed');
  }, []);

  const mobileContextButtonLabel = isReaderRoute ? '信息' : isCollectionRoute ? '统计' : '入口';
  const mobileContextPanelLabel = isReaderRoute ? '文档信息' : isCollectionRoute ? '资料统计' : '公开入口';
  const showHeaderContextButton = isReaderRoute || isCollectionRoute;
  const showMobileCollectionShortcuts = !isHomeRoute;
  const mobileAppearancePanel = (
    <AppearanceControl
      renderVariant="panel"
      appearance={appearance}
      onThemeChange={(themeId) => setAppearance((current) => ({ ...current, themeId }))}
      onFontScaleChange={(fontScale) => setAppearance((current) => ({ ...current, fontScale }))}
    />
  );

  return (
    <div className={`app-shell ${mobilePanel !== 'closed' ? 'has-mobile-panel' : ''}`.trim()} style={shellStyle}>
      <header ref={headerRef} className={`app-header ${headerCompressed ? 'is-scrolled' : ''}`.trim()}>
        <div className="header-brand">
          <div className="section-kicker">公开项目入口</div>
          <h1>AI主导学习平台</h1>
        </div>
        <div className="header-actions">
          <nav className="top-nav">
            <NavLink to="/">首页</NavLink>
            <NavLink to="/math">高数示例</NavLink>
            <NavLink to="/platform">项目文档</NavLink>
          </nav>
          {showHeaderContextButton ? (
            <button
              type="button"
              className={`header-context-button ${mobilePanel === 'context' ? 'is-active' : ''}`.trim()}
              aria-expanded={mobilePanel === 'context'}
              onClick={() => toggleMobilePanel('context')}
            >
              信息
            </button>
          ) : null}
          <AppearanceControl
            className="appearance-control--desktop"
            appearance={appearance}
            onThemeChange={(themeId) => setAppearance((current) => ({ ...current, themeId }))}
            onFontScaleChange={(fontScale) => setAppearance((current) => ({ ...current, fontScale }))}
          />
        </div>
        <nav className="mobile-top-nav">
          <NavLink to="/">首页</NavLink>
          <NavLink to="/math">高数</NavLink>
          <NavLink to="/platform">文档</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<LandingPageV2 />} />
        <Route
          path="/math"
          element={
            <CollectionRouteView
              collection="math-kb"
              search={search}
              onSearchChange={setSearch}
              recentItems={recentItems}
              mobilePanel={mobilePanel}
              onCloseMobilePanel={closeMobilePanel}
              mobileAppearance={mobileAppearancePanel}
              mobileContextLabel={mobileContextPanelLabel}
            />
          }
        />
        <Route
          path="/platform"
          element={
            <CollectionRouteView
              collection="platform-docs"
              search={search}
              onSearchChange={setSearch}
              recentItems={recentItems}
              mobilePanel={mobilePanel}
              onCloseMobilePanel={closeMobilePanel}
              mobileAppearance={mobileAppearancePanel}
              mobileContextLabel={mobileContextPanelLabel}
            />
          }
        />
        <Route path="/library" element={<Navigate to="/" replace />} />
        <Route
          path="/read/:id"
          element={
            <ReaderRouteView
              search={search}
              onSearchChange={setSearch}
              rememberResource={rememberResource}
              onZoom={setLightbox}
              mobilePanel={mobilePanel}
              onCloseMobilePanel={closeMobilePanel}
              mobileAppearance={mobileAppearancePanel}
              mobileContextLabel={mobileContextPanelLabel}
              themeId={appearance.themeId}
            />
          }
        />
      </Routes>

      {mobileQuickNavOpen ? (
        <button
          type="button"
          className="mobile-actions-backdrop"
          aria-label="关闭快捷导航"
          onClick={() => setMobileQuickNavOpen(false)}
        />
      ) : null}
      <div className={`mobile-actions ${mobileQuickNavOpen ? 'is-open' : ''}`.trim()} aria-label="移动端快捷入口">
        <button
          type="button"
          className="mobile-actions-trigger"
          aria-label={mobileQuickNavOpen ? '收起快捷导航' : '打开快捷导航'}
          aria-expanded={mobileQuickNavOpen}
          onClick={() => setMobileQuickNavOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="mobile-actions-menu" aria-hidden={!mobileQuickNavOpen}>
          <div className="mobile-actions-brand">
            <div className="section-kicker">公开项目入口</div>
            <strong>AI主导学习平台</strong>
          </div>
          <nav className="mobile-actions-nav">
            <NavLink to="/" onClick={() => setMobileQuickNavOpen(false)}>
              首页
            </NavLink>
            <NavLink to="/math" onClick={() => setMobileQuickNavOpen(false)}>
              高数示例
            </NavLink>
            <NavLink to="/platform" onClick={() => setMobileQuickNavOpen(false)}>
              项目文档
            </NavLink>
          </nav>
          <div className="mobile-actions-shortcuts">
            {showMobileCollectionShortcuts ? (
              <>
                <button
                  type="button"
                  className={mobilePanel === 'catalog' ? 'is-active' : ''}
                  aria-expanded={mobilePanel === 'catalog'}
                  onClick={() => toggleMobilePanel('catalog')}
                >
                  目录
                </button>
                <button
                  type="button"
                  className={mobilePanel === 'context' ? 'is-active' : ''}
                  aria-expanded={mobilePanel === 'context'}
                  onClick={() => toggleMobilePanel('context')}
                >
                  {mobileContextButtonLabel}
                </button>
              </>
            ) : null}
            <button
              type="button"
              className={mobilePanel === 'appearance' ? 'is-active' : ''}
              aria-expanded={mobilePanel === 'appearance'}
              onClick={() => toggleMobilePanel('appearance')}
            >
              外观
            </button>
          </div>
        </div>
      </div>

      <ZoomLightbox lightbox={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

interface AppearanceControlProps {
  appearance: AppearanceState;
  onThemeChange: (themeId: ThemeId) => void;
  onFontScaleChange: (fontScale: FontScaleId) => void;
  compact?: boolean;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  renderVariant?: 'popover' | 'panel';
}

function AppearanceControl({
  appearance,
  onThemeChange,
  onFontScaleChange,
  compact = false,
  className = '',
  open,
  onOpenChange,
  renderVariant = 'popover'
}: AppearanceControlProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const activeTheme = getThemePreset(appearance.themeId);
  const isControlled = typeof open === 'boolean';
  const isOpen = renderVariant === 'panel' ? true : isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  useEffect(() => {
    if (renderVariant === 'popover' && !isControlled) {
      setInternalOpen(false);
    }
  }, [isControlled, location.pathname, renderVariant]);

  useEffect(() => {
    if (renderVariant !== 'popover' || !isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, renderVariant, setOpen]);

  const panelContent = (
    <div className={`appearance-popover ${renderVariant === 'panel' ? 'appearance-popover--panel' : ''}`.trim()}>
      <div className="appearance-popover-header">
        <div className="section-kicker">Reading Setup</div>
        <h3>阅读外观</h3>
        <p>切换护眼底色和阅读字号，首页、资料库和阅读页会保持一致。</p>
      </div>

      <div className="appearance-section">
        <div className="appearance-section-head">
          <strong>护眼背景</strong>
          <span>{activeTheme.tone}</span>
        </div>
        <div className="theme-grid">
          {THEME_PRESETS.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-option ${appearance.themeId === theme.id ? 'is-active' : ''}`.trim()}
              onClick={() => onThemeChange(theme.id)}
              aria-pressed={appearance.themeId === theme.id}
            >
              <span className="theme-option-swatches">
                {theme.swatches.map((color) => (
                  <span key={color} style={{ background: color }} />
                ))}
              </span>
              <span className="theme-option-copy">
                <strong>{theme.label}</strong>
                <small>{theme.tone}</small>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="appearance-section">
        <div className="appearance-section-head">
          <strong>正文字号</strong>
          <span>{FONT_SCALE_PRESETS.find((item) => item.id === appearance.fontScale)?.hint}</span>
        </div>
        <div className="font-scale-row">
          {FONT_SCALE_PRESETS.map((scale) => (
            <button
              key={scale.id}
              type="button"
              className={`font-scale-option ${appearance.fontScale === scale.id ? 'is-active' : ''}`.trim()}
              onClick={() => onFontScaleChange(scale.id)}
              aria-pressed={appearance.fontScale === scale.id}
            >
              <strong>{scale.label}</strong>
              <span>{scale.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (renderVariant === 'panel') {
    return <div className={`appearance-control ${className}`.trim()}>{panelContent}</div>;
  }

  return (
    <div ref={rootRef} className={`appearance-control ${className}`.trim()}>
      <button
        type="button"
        className={`appearance-trigger ${isOpen ? 'is-open' : ''}`.trim()}
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="appearance-trigger-dot" />
        <span>{compact ? '外观' : `阅读外观 · ${activeTheme.label}`}</span>
      </button>

      {isOpen ? panelContent : null}
    </div>
  );
}

interface FrameProps {
  left: ReactNode;
  children: ReactNode;
  right: ReactNode;
  mobilePanel: MobilePanel;
  onCloseMobilePanel: () => void;
  mobileAppearance: ReactNode;
  mobileContextLabel: string;
  mode?: 'default' | 'reader' | 'collection';
}

function Frame({
  left,
  children,
  right,
  mobilePanel,
  onCloseMobilePanel,
  mobileAppearance,
  mobileContextLabel,
  mode = 'default'
}: FrameProps) {
  const mobileContent =
    mobilePanel === 'catalog' ? left : mobilePanel === 'context' ? right : mobilePanel === 'appearance' ? mobileAppearance : null;
  const frameClassName = [
    'frame-grid',
    mode === 'reader' ? 'frame-grid--reader' : '',
    mode === 'collection' ? 'frame-grid--collection' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className={frameClassName}>
        <aside className="frame-left">{left}</aside>
        <main className="frame-main">{children}</main>
        <aside className="frame-right">{right}</aside>
      </div>

      {mobilePanel !== 'closed' && mobileContent ? (
        <>
          <button type="button" className="mobile-panel-backdrop" aria-label="关闭面板" onClick={onCloseMobilePanel} />
          <section
            className="mobile-panel-shell"
            data-panel={mobilePanel}
            role="dialog"
            aria-modal="true"
            aria-label={mobilePanel === 'catalog' ? '资料目录' : mobilePanel === 'appearance' ? '阅读外观' : mobileContextLabel}
          >
            <button type="button" className="mobile-panel-close" onClick={onCloseMobilePanel}>
              关闭
            </button>
            <div className="mobile-panel-scroll">{mobileContent}</div>
          </section>
        </>
      ) : null}
    </>
  );
}

interface CatalogSidebarProps {
  activeId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  collectionFilter: CollectionFilter;
  onCollectionChange: (value: CollectionFilter) => void;
  items: CatalogItem[];
  onLinkSelect?: () => void;
}

function CatalogSidebar({
  activeId,
  search,
  onSearchChange,
  collectionFilter,
  onCollectionChange,
  items,
  onLinkSelect
}: CatalogSidebarProps) {
  const grouped = useMemo(() => buildCatalogSections(items, collectionFilter), [items, collectionFilter]);
  const shouldExpandAll = Boolean(search.trim());

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <div className="section-kicker">资料目录</div>
        <h2>资料导航</h2>
      </div>
      <label className="search-field">
        <span>搜索</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="按标题、模块、资源类型或正文搜索"
        />
      </label>
      <div className="filter-strip">
        <button
          type="button"
          className={collectionFilter === 'all' ? 'is-active' : ''}
          onClick={() => onCollectionChange('all')}
        >
          全部
        </button>
        <button
          type="button"
          className={collectionFilter === 'math-kb' ? 'is-active' : ''}
          onClick={() => onCollectionChange('math-kb')}
        >
          知识库示例
        </button>
        <button
          type="button"
          className={collectionFilter === 'platform-docs' ? 'is-active' : ''}
          onClick={() => onCollectionChange('platform-docs')}
        >
          平台文档
        </button>
      </div>

      <div className="layer-tree">
        {grouped.length ? (
          grouped.map((section) => (
            <details key={section.id} open={shouldExpandAll || section.defaultOpen}>
              <summary className="tree-summary">
                <span className="tree-summary-copy">
                  <small>{section.kicker}</small>
                  <strong>{section.label}</strong>
                </span>
                <span>{section.count}</span>
              </summary>
              <div className="tree-items">
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    className={`tree-item ${activeId === item.id ? 'is-active' : ''}`}
                    to={`/read/${item.id}`}
                    onClick={onLinkSelect}
                  >
                    <span>{item.title}</span>
                    <small>{getItemMeta(item)}</small>
                  </Link>
                ))}
              </div>
            </details>
          ))
        ) : (
          <div className="empty-state">当前筛选下还没有命中内容，可以换一个集合或修改搜索词。</div>
        )}
      </div>
    </div>
  );
}

interface CollectionSidebarV2Props {
  activeId?: string;
  collection: ResourceCollection;
  search: string;
  onSearchChange: (value: string) => void;
  items: CatalogItem[];
  sections?: CatalogSection[];
  kicker?: string;
  title?: string;
  searchPlaceholder?: string;
  emptyState?: string;
  backLink?: SidebarBackLink;
  onLinkSelect?: () => void;
}

function CollectionSidebarV2({
  activeId,
  collection,
  search,
  onSearchChange,
  items,
  sections,
  kicker,
  title,
  searchPlaceholder,
  emptyState,
  backLink,
  onLinkSelect
}: CollectionSidebarV2Props) {
  const fallbackSections = useMemo(() => getCollectionSections(items, collection), [items, collection]);
  const resolvedSections = sections ?? fallbackSections;
  const shouldExpandAll = Boolean(search.trim());

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <div className="section-kicker">{kicker ?? getCollectionHeroLabel(collection)}</div>
        <h2>{title ?? getCollectionDirectoryTitle(collection)}</h2>
      </div>
      {backLink ? (
        <Link className="sidebar-back-link" to={backLink.to} onClick={onLinkSelect}>
          {backLink.label}
        </Link>
      ) : null}
      <label className="search-field">
        <span>搜索</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder ?? getCollectionSearchPlaceholder(collection)}
        />
      </label>
      <div className="layer-tree">
        {resolvedSections.length ? (
          resolvedSections.map((section) => (
            <details key={section.id} open={shouldExpandAll || section.defaultOpen}>
              <summary className="tree-summary">
                <span className="tree-summary-copy">
                  <small>{section.kicker}</small>
                  <strong>{section.label}</strong>
                </span>
                <span>{section.count}</span>
              </summary>
              <div className="tree-items">
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    className={`tree-item ${activeId === item.id ? 'is-active' : ''}`}
                    to={`/read/${item.id}`}
                    onClick={onLinkSelect}
                  >
                    <span>{item.title}</span>
                    <small>{getItemMeta(item)}</small>
                  </Link>
                ))}
              </div>
            </details>
          ))
        ) : (
          <div className="empty-state">
            {emptyState ?? (collection === 'math-kb' ? '当前知识库示例下没有命中内容。' : '当前平台文档下没有命中内容。')}
          </div>
        )}
      </div>
    </div>
  );
}

function LandingPageV2() {
  const overviewBlocks = useMemo<ResolvedLandingOverviewBlockConfig[]>(
    () =>
      LANDING_OVERVIEW_BLOCKS.map((block) => {
        const quickLinks = (block.quickLinks ?? [])
          .map((entry) => {
            const item = catalogByPath.get(entry.path);
            return item ? { ...entry, item } : null;
          })
          .filter((entry): entry is ResolvedLandingDocLinkConfig => Boolean(entry));

        const actionHref =
          block.actionKind === 'route'
            ? block.actionTarget
            : (() => {
                const actionItem = catalogByPath.get(block.actionTarget);
                return actionItem ? `/read/${actionItem.id}` : null;
              })();

        return actionHref ? { ...block, quickLinks, actionHref } : null;
      }).filter((block): block is ResolvedLandingOverviewBlockConfig => Boolean(block)),
    []
  );

  return (
    <div className="page-stack landing-stage">
      <section className="landing-shell landing-shell--overview">
        <div className="landing-overview-head">
          <div className="section-kicker">项目文档总览</div>
          <h2>AI主导学习平台</h2>
          <p>先看导读，再进入恢复后的架构、需求、PRD、技术方案、学科接入和比赛交付真源文档。</p>
        </div>
        <div className="overview-grid">
          {overviewBlocks.map((block) => (
            <article key={block.id} className={`overview-panel ${block.className}`.trim()}>
              <div className="overview-panel__intro">
                <div className="section-kicker">{block.kicker}</div>
                <h3>{block.title}</h3>
                <p>{block.description}</p>
              </div>
              <div className="overview-panel__footer">
                <Link to={block.actionHref} className="overview-panel__action">
                  {block.actionLabel}
                </Link>
                {block.stats?.length ? (
                  <div className="overview-stat-list">
                    {block.stats.map((entry) => (
                      <div key={`${block.id}-${entry.label}`} className="overview-stat-row">
                        <div className="overview-stat-copy">
                          <span>{entry.label}</span>
                          <small>{entry.detail}</small>
                        </div>
                        <strong>{entry.value}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
                {block.quickLinks.length ? (
                  <div className="overview-quick-list">
                    {block.quickLinks.map((entry) => (
                      <Link key={entry.path} to={`/read/${entry.item.id}`} className="overview-quick-link">
                        <strong>{entry.label}</strong>
                        <span>{getDocumentPriorityLabel(getDocumentPriority(entry.item))}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
                {block.footnote ? <div className="overview-panel__note">{block.footnote}</div> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function CollectionAsideV2({
  collection,
  items,
  recentItems,
  onLinkSelect
}: {
  collection: ResourceCollection;
  items: CatalogItem[];
  recentItems: CatalogItem[];
  onLinkSelect?: () => void;
}) {
  const counts = useMemo(() => buildCollectionCounts(items, collection), [items, collection]);
  const recentCollectionItems = useMemo(
    () => recentItems.filter((item) => item.collection === collection).slice(0, 6),
    [recentItems, collection]
  );

  return (
    <div className="aside-panel">
      <div className="panel-header">
        <div className="section-kicker">{getCollectionHeroLabel(collection)}</div>
        <h2>{getCollectionDisplayName(collection)}</h2>
      </div>
      <p className="aside-note">{getCollectionDescription(collection)}</p>
      <div className="count-list">
        {counts.map(({ label, count }) => (
          <div key={label} className="count-row">
            <span>{label}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>

      {recentCollectionItems.length ? (
        <>
          <div className="panel-header panel-header--spaced">
            <div className="section-kicker">最近阅读</div>
            <h2>继续阅读</h2>
          </div>
          <div className="aside-list">
            {recentCollectionItems.map((item) => (
              <Link key={item.id} className="aside-link" to={`/read/${item.id}`} onClick={onLinkSelect}>
                <strong>{item.title}</strong>
                <span>{getItemMeta(item)}</span>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CollectionPageV2({
  collection,
  search,
  sections
}: {
  collection: ResourceCollection;
  search: string;
  sections: CatalogSection[];
}) {
  return (
    <div className="page-stack">
      <section className="section-header section-header--page">
        <div className="section-kicker">{getCollectionHeroLabel(collection)}</div>
        <h2>{getCollectionDisplayName(collection)}</h2>
        <p>
          {search ? `当前检索词为“${search}”。` : getCollectionDescription(collection)}
        </p>
      </section>

      {sections.length ? (
        sections.map((section) => (
          <details
            key={section.id}
            className="library-section library-section--collapsible"
            open={Boolean(search.trim()) || section.defaultOpen}
          >
            <summary className="library-section-summary">
              <span className="tree-summary-copy">
                <small>{section.kicker}</small>
                <strong>{section.label}</strong>
              </span>
              <span>{section.count}</span>
            </summary>

            <div className="resource-list">
              {section.items.map((item) => (
                <Link key={item.id} to={`/read/${item.id}`} className="resource-row">
                  <div>
                    <div className="section-kicker">{getItemMeta(item)}</div>
                    <strong>{item.title}</strong>
                  </div>
                  <span>{item.type === 'markdown' ? item.resourceKind : item.type.toUpperCase()}</span>
                </Link>
              ))}
            </div>
          </details>
        ))
      ) : (
        <div className="empty-state">
          {collection === 'math-kb' ? '当前高数示例下没有命中内容。' : '当前项目文档下没有命中内容。'}
        </div>
      )}
    </div>
  );
}

function CollectionRouteView({
  collection,
  search,
  onSearchChange,
  recentItems,
  mobilePanel,
  onCloseMobilePanel,
  mobileAppearance,
  mobileContextLabel
}: {
  collection: ResourceCollection;
  search: string;
  onSearchChange: (value: string) => void;
  recentItems: CatalogItem[];
  mobilePanel: MobilePanel;
  onCloseMobilePanel: () => void;
  mobileAppearance: ReactNode;
  mobileContextLabel: string;
}) {
  const baseItems = useMemo(() => getCollectionItems(collection), [collection]);
  const filteredItems = useMemo(() => searchCatalog(baseItems, search), [baseItems, search]);
  const sections = useMemo(() => getCollectionSections(filteredItems, collection), [filteredItems, collection]);

  return (
    <Frame
      mode="collection"
      left={
        <CollectionSidebarV2
          collection={collection}
          search={search}
          onSearchChange={onSearchChange}
          items={filteredItems}
          onLinkSelect={onCloseMobilePanel}
        />
      }
      right={
        <CollectionAsideV2
          collection={collection}
          items={filteredItems}
          recentItems={recentItems}
          onLinkSelect={onCloseMobilePanel}
        />
      }
      mobilePanel={mobilePanel}
      onCloseMobilePanel={onCloseMobilePanel}
      mobileAppearance={mobileAppearance}
      mobileContextLabel={mobileContextLabel}
    >
      <CollectionPageV2 collection={collection} search={search} sections={sections} />
    </Frame>
  );
}

function ReaderRouteView({
  search,
  onSearchChange,
  rememberResource,
  onZoom,
  mobilePanel,
  onCloseMobilePanel,
  mobileAppearance,
  mobileContextLabel,
  themeId
}: {
  search: string;
  onSearchChange: (value: string) => void;
  rememberResource: (item: CatalogItem) => void;
  onZoom: (lightbox: LightboxState) => void;
  mobilePanel: MobilePanel;
  onCloseMobilePanel: () => void;
  mobileAppearance: ReactNode;
  mobileContextLabel: string;
  themeId: ThemeId;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = id ? catalogById.get(id) : undefined;
  const scope = useMemo(() => (item ? getNavigationScope(item) : null), [item]);
  const scopeConfig = useMemo(() => (scope ? getScopeConfig(scope) : null), [scope]);
  const collectionItems = useMemo(() => {
    if (!item) {
      return [];
    }

    if (scope) {
      return getScopeItems(scope);
    }

    return getCollectionItems(item.collection);
  }, [item, scope]);
  const sidebarItems = useMemo(() => {
    if (!item) {
      return [];
    }

    const filteredItems = searchCatalog(collectionItems, search);
    if (!search.trim()) {
      return collectionItems;
    }

    if (filteredItems.some((candidate) => candidate.id === item.id)) {
      return filteredItems;
    }

    return uniqueCatalogItems([item, ...filteredItems]);
  }, [collectionItems, item, search]);
  const sidebarSections = useMemo(() => {
    if (!item) {
      return [];
    }

    if (scope) {
      return buildScopeSections(scope, sidebarItems, item, Boolean(search.trim()));
    }

    return getCollectionSections(sidebarItems, item.collection);
  }, [item, scope, sidebarItems, search]);

  useLayoutEffect(() => {
    if (!item) {
      return;
    }

    const scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      scrollingElement.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    window.scrollTo(0, 0);
  }, [item?.id]);

  useEffect(() => {
    if (!item) {
      navigate('/');
      return;
    }
    if (item.type === 'image') {
      navigate(getCollectionPath(item.collection), { replace: true });
      return;
    }
    rememberResource(item);
  }, [item, navigate, rememberResource]);

  if (!item || item.type === 'image') {
    return null;
  }

  const outline = extractOutline(item.rawText);
  const related = getScopedRelatedResources(item, scope);

  return (
    <Frame
      mode="reader"
      key={item.id}
      left={
        <CollectionSidebarV2
          activeId={item.id}
          collection={item.collection}
          search={search}
          onSearchChange={onSearchChange}
          items={sidebarItems}
          sections={sidebarSections}
          kicker={scopeConfig?.kicker}
          title={scopeConfig?.title}
          searchPlaceholder={scopeConfig?.searchPlaceholder}
          emptyState={scopeConfig?.emptyState}
          backLink={scopeConfig?.backLink}
          onLinkSelect={onCloseMobilePanel}
        />
      }
      right={
        <ReaderAside
          item={item}
          outline={outline}
          related={related}
          onLinkSelect={onCloseMobilePanel}
        />
      }
      mobilePanel={mobilePanel}
      onCloseMobilePanel={onCloseMobilePanel}
      mobileAppearance={mobileAppearance}
      mobileContextLabel={mobileContextLabel}
    >
      <ReaderPage key={item.id} item={item} outline={outline} onZoom={onZoom} themeId={themeId} />
    </Frame>
  );
}

function HomeAside({
  recentItems,
  mathItems,
  platformItems,
  onLinkSelect
}: {
  recentItems: CatalogItem[];
  mathItems: CatalogItem[];
  platformItems: CatalogItem[];
  onLinkSelect?: () => void;
}) {
  return (
    <div className="aside-panel">
      <div className="panel-header">
        <div className="section-kicker">Math Highlights</div>
        <h2>高数主入口</h2>
      </div>
      <div className="aside-list">
        {mathItems.slice(0, 3).map((item) => (
          <Link key={item.id} className="aside-link" to={`/read/${item.id}`} onClick={onLinkSelect}>
            <strong>{item.title}</strong>
            <span>{getItemMeta(item)}</span>
          </Link>
        ))}
      </div>

      <div className="panel-header panel-header--spaced">
        <div className="section-kicker">Platform Docs</div>
        <h2>平台入口</h2>
      </div>
      <div className="aside-list">
        {platformItems.slice(0, 3).map((item) => (
          <Link key={item.id} className="aside-link" to={`/read/${item.id}`} onClick={onLinkSelect}>
            <strong>{item.title}</strong>
            <span>{getItemMeta(item)}</span>
          </Link>
        ))}
      </div>

      <div className="panel-header panel-header--spaced">
        <div className="section-kicker">Recent Reads</div>
        <h2>阅读轨迹</h2>
      </div>
      <div className="aside-list">
        {recentItems.length ? (
          recentItems.map((item) => (
            <Link key={item.id} className="aside-link" to={`/read/${item.id}`} onClick={onLinkSelect}>
              <strong>{item.title}</strong>
              <span>{getItemMeta(item)}</span>
            </Link>
          ))
        ) : (
          <div className="empty-state">打开一份文档后，这里会记录你的最近查看。</div>
        )}
      </div>
    </div>
  );
}

function LibraryAside({
  collectionFilter,
  filteredCatalog
}: {
  collectionFilter: CollectionFilter;
  filteredCatalog: CatalogItem[];
}) {
  const counts = useMemo(() => {
    if (collectionFilter === 'math-kb') {
      return buildMathSections(filteredCatalog).map((section) => ({ label: `${section.kicker} ${section.label}`, count: section.count }));
    }

    if (collectionFilter === 'platform-docs') {
      return buildPlatformSections(filteredCatalog).map((section) => ({ label: section.label, count: section.count }));
    }

    return [
      { label: getCollectionDisplayName('math-kb'), count: filteredCatalog.filter((item) => item.collection === 'math-kb').length },
      { label: getCollectionDisplayName('platform-docs'), count: filteredCatalog.filter((item) => item.collection === 'platform-docs').length }
    ];
  }, [collectionFilter, filteredCatalog]);

  return (
    <div className="aside-panel">
      <div className="panel-header">
        <div className="section-kicker">Library Stats</div>
        <h2>{getCollectionLabel(collectionFilter)}</h2>
      </div>
      <div className="count-list">
        {counts.map(({ label, count }) => (
          <div key={label} className="count-row">
            <span>{label}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
      <p className="aside-note">
        当前资料库支持按集合切换浏览。高等数学_测试按导航层和资产层阅读，平台资料按导读层和开发层组织。
      </p>
    </div>
  );
}

function HomePage({
  recentItems,
  mathSections,
  mathCount,
  platformCount
}: {
  recentItems: CatalogItem[];
  mathSections: CatalogSection[];
  mathCount: number;
  platformCount: number;
}) {
  const courseOverview = mathFeaturedResources[0];
  const platformOverview = platformFeaturedResources[0];

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--showcase">
        <div className="hero-copy">
          <div className="section-kicker">Public Showcase</div>
          <h2>高等数学_测试知识库已经接入站点，并与平台文档、比赛资料一起公开可见。</h2>
          <p>
            这里既是课程知识库的公开入口，也是平台说明与答辩资料的统一阅读台。高数内容按模块组织，
            平台资料按层级归档，便于评审浏览，也方便直接进入具体知识点。
          </p>
          <div className="hero-actions">
            <Link to="/library" className="accent-button">
              进入资料库
            </Link>
            {courseOverview ? <Link to={`/read/${courseOverview.id}`}>查看课程地图</Link> : null}
          </div>
        </div>
        <div className="hero-media hero-media--collections">
          {courseOverview ? (
            <Link to={`/read/${courseOverview.id}`} className="collection-card collection-card--math">
              <div className="section-kicker">Primary Entrance</div>
              <strong>高等数学_测试知识库</strong>
              <p>优先展示课程总览、核心模块、课堂重构和教师运营样板。</p>
              <div className="metric-row">
                <span>{mathSections.length} 个模块分组</span>
                <span>{mathCount} 份公开条目</span>
              </div>
            </Link>
          ) : null}
          {platformOverview ? (
            <Link to={`/read/${platformOverview.id}`} className="collection-card collection-card--platform">
              <div className="section-kicker">Supporting Docs</div>
              <strong>平台文档与比赛资料</strong>
              <p>保留产品总纲、统一对象契约、平台主线和比赛 PDF，作为公开补充入口。</p>
              <div className="metric-row">
                <span>{platformCount} 份平台资料</span>
                <span>统一收口到同一站点</span>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="shelf-section">
        <div className="section-header">
          <div className="section-kicker">Course Modules</div>
          <h2>高数模块一览</h2>
        </div>
        <div className="module-chip-grid">
          {mathSections.map((section) => (
            <Link key={section.id} to={`/read/${section.items[0].id}`} className="module-chip">
              <small>{section.kicker}</small>
              <strong>{section.label}</strong>
              <span>{section.count} 篇</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf-section">
        <div className="section-header">
          <div className="section-kicker">Recommended Routes</div>
          <h2>公开站推荐入口</h2>
        </div>
        <div className="spotlight-grid">
          {mathFeaturedResources.slice(0, 3).map((item) => (
            <Link key={item.id} to={`/read/${item.id}`} className="spotlight-card">
              <div className="section-kicker">知识库示例</div>
              <strong>{item.title}</strong>
              <span>{getItemMeta(item)}</span>
            </Link>
          ))}
          {platformFeaturedResources.slice(0, 3).map((item) => (
            <Link key={item.id} to={`/read/${item.id}`} className="spotlight-card spotlight-card--platform">
              <div className="section-kicker">平台文档</div>
              <strong>{item.title}</strong>
              <span>{getItemMeta(item)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf-section">
        <div className="section-header">
          <div className="section-kicker">Recent Reads</div>
          <h2>继续你的阅读路径</h2>
        </div>
        <div className="shelf-list">
          {recentItems.length ? (
            recentItems.map((item) => (
              <Link key={item.id} to={`/read/${item.id}`} className="shelf-link">
                <strong>{item.title}</strong>
                <span>{getItemMeta(item)}</span>
              </Link>
            ))
          ) : (
            <div className="empty-state">你还没有打开任何文档，可以先从课程地图、学习路径或平台总索引进入。</div>
          )}
        </div>
      </section>
    </div>
  );
}

function LibraryPage({
  collectionFilter,
  search,
  blocks
}: {
  collectionFilter: CollectionFilter;
  search: string;
  blocks: LibraryBlock[];
}) {
  return (
    <div className="page-stack">
      <section className="section-header section-header--page">
        <div className="section-kicker">Library</div>
        <h2>{getCollectionLabel(collectionFilter)}</h2>
        <p>
          {search
            ? `当前检索词为“${search}”，结果已经按集合和模块重新收口。`
            : '这里统一展示高等数学_测试知识库、平台主文档和比赛资料，方便公开浏览与深链访问。'}
        </p>
      </section>

      {blocks.length ? (
        blocks.map((block) => (
          <section key={block.id} className="library-block">
            <div className="section-header">
              <div className="section-kicker">{block.kicker}</div>
              <h2>{block.title}</h2>
              <p>{block.description}</p>
            </div>

            {block.sections.map((section) => (
              <section key={section.id} className="library-section">
                <div className="section-header section-header--compact">
                  <div className="section-kicker">{section.kicker}</div>
                  <h2>{section.label}</h2>
                </div>

                <div className="resource-list">
                  {section.items.map((item) => (
                    <Link key={item.id} to={`/read/${item.id}`} className="resource-row">
                      <div>
                        <div className="section-kicker">{getItemMeta(item)}</div>
                        <strong>{item.title}</strong>
                      </div>
                      <span>{item.type === 'markdown' ? item.resourceKind : item.type.toUpperCase()}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </section>
        ))
      ) : (
        <div className="empty-state">当前筛选和检索下还没有结果，可以切回全部资料或换一个关键词。</div>
      )}
    </div>
  );
}

interface ReaderRouteProps {
  search: string;
  onSearchChange: (value: string) => void;
  collectionFilter: CollectionFilter;
  onCollectionChange: (value: CollectionFilter) => void;
  items: CatalogItem[];
  rememberResource: (item: CatalogItem) => void;
  onZoom: (lightbox: LightboxState) => void;
  mobilePanel: MobilePanel;
  onCloseMobilePanel: () => void;
  mobileAppearance: ReactNode;
  mobileContextLabel: string;
  themeId: ThemeId;
}

function ReaderRoute(props: ReaderRouteProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = id ? catalogById.get(id) : undefined;
  const sidebarItems = useMemo(() => {
    if (!item) {
      return props.items;
    }

    if (props.items.some((candidate) => candidate.id === item.id)) {
      return props.items;
    }

    return filterCatalogByCollection(navigableCatalog, item.collection);
  }, [item, props.items]);

  useLayoutEffect(() => {
    if (!item) {
      return;
    }

    const scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      scrollingElement.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    window.scrollTo(0, 0);
  }, [item?.id]);

  useEffect(() => {
    if (!item) {
      navigate('/');
      return;
    }
    if (item.type === 'image') {
      navigate('/library', { replace: true });
      return;
    }
    props.rememberResource(item);
  }, [item, navigate, props.rememberResource]);

  if (!item || item.type === 'image') {
    return null;
  }

  const outline = extractOutline(item.rawText);
  const related = getRelatedResources(item);

  return (
    <Frame
      mode="reader"
      key={item.id}
      left={
        <CatalogSidebar
          activeId={item.id}
          search={props.search}
          onSearchChange={props.onSearchChange}
          collectionFilter={props.collectionFilter}
          onCollectionChange={props.onCollectionChange}
          items={sidebarItems}
          onLinkSelect={props.onCloseMobilePanel}
        />
      }
      right={
        <ReaderAside
          item={item}
          outline={outline}
          related={related}
          onLinkSelect={props.onCloseMobilePanel}
        />
      }
      mobilePanel={props.mobilePanel}
      onCloseMobilePanel={props.onCloseMobilePanel}
      mobileAppearance={props.mobileAppearance}
      mobileContextLabel={props.mobileContextLabel}
    >
      <ReaderPage key={item.id} item={item} outline={outline} onZoom={props.onZoom} themeId={props.themeId} />
    </Frame>
  );
}

function ReaderAside({
  item,
  outline,
  related,
  onLinkSelect
}: {
  item: CatalogItem;
  outline: ReturnType<typeof extractOutline>;
  related: CatalogItem[];
  onLinkSelect?: () => void;
}) {
  return (
    <div className="aside-panel">
      <div className="panel-header">
        <div className="section-kicker">当前文档</div>
        <h2>{item.title}</h2>
      </div>
      <div className="meta-stack">
        <div className="count-row">
          <span>集合</span>
          <strong>{getCollectionDisplayName(item.collection)}</strong>
        </div>
        <div className="count-row">
          <span>{item.collection === 'math-kb' ? '模块' : '层级'}</span>
          <strong>{item.collection === 'math-kb' ? `${item.moduleKey} · ${item.moduleLabel}` : item.layer}</strong>
        </div>
        <div className="count-row">
          <span>资源类型</span>
          <strong>{item.resourceKind}</strong>
        </div>
        <div className="count-row">
          <span>角色</span>
          <strong>{getRoleLabel(item.role)}</strong>
        </div>
      </div>

      {outline.length ? (
        <>
          <div className="panel-header panel-header--spaced">
            <div className="section-kicker">文档提纲</div>
            <h2>快速跳转</h2>
          </div>
          <div className="outline-list">
            {outline.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`outline-link level-${entry.level}`}
                onClick={() => {
                  document.getElementById(entry.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  onLinkSelect?.();
                }}
              >
                {entry.text}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="panel-header panel-header--spaced">
        <div className="section-kicker">相关文档</div>
        <h2>继续阅读</h2>
      </div>
      <div className="aside-list">
        {related.map((resource) => (
          <Link key={resource.id} className="aside-link" to={`/read/${resource.id}`} onClick={onLinkSelect}>
            <strong>{resource.title}</strong>
            <span>{getItemMeta(resource)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ReaderPage({
  item,
  outline,
  onZoom,
  themeId
}: {
  item: CatalogItem;
  outline: ReturnType<typeof extractOutline>;
  onZoom: (lightbox: LightboxState) => void;
  themeId: ThemeId;
}) {
  return (
    <div className="page-stack">
      <section className="reader-header">
        <div>
          <div className="section-kicker">
            {item.collection === 'math-kb'
              ? `${getCollectionDisplayName(item.collection)} · ${item.moduleKey} · ${item.resourceKind}`
              : `${item.layer} · ${item.resourceKind}`}
          </div>
          <h2>{item.title}</h2>
          <p>{item.relativePath}</p>
        </div>
        {item.assetUrl ? (
          <div className="toolbar-actions">
            <a href={item.assetUrl} target="_blank" rel="noreferrer">
              原文件打开
            </a>
          </div>
        ) : null}
      </section>

      {item.type === 'markdown' ? (
        <MarkdownArticle item={item} outline={outline} onOpenLightbox={onZoom} themeId={themeId} />
      ) : null}
      {item.type === 'pdf' && item.assetUrl ? <PdfViewer src={item.assetUrl} title={item.title} /> : null}
    </div>
  );
}

export default App;
