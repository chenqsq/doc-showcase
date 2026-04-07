export interface ActiveDocSectionMeta {
  id: string;
  label: string;
  summary: string;
}

export interface ActiveDocMeta {
  order: number;
  path: string;
  navLabel: string;
  shortTitle: string;
  summary: string;
  sectionId: string;
}

export const ACTIVE_DOC_SECTIONS: ActiveDocSectionMeta[] = [
  {
    id: 'foundation',
    label: '基础入口',
    summary: '先统一阅读顺序、产品定位和边界，再进入闭环与架构设计。'
  },
  {
    id: 'learning-loop',
    label: '学习闭环',
    summary: '围绕学生主闭环定义需求、风险判定、学习计划和长期记忆回流。'
  },
  {
    id: 'architecture',
    label: '系统架构',
    summary: '统一描述前端、后端和平台服务，不再拆成双产品叙事。'
  },
  {
    id: 'integration',
    label: '平台集成',
    summary: '聚焦腾讯智能体开发平台集成、数据对象与接口映射。'
  },
  {
    id: 'validation',
    label: '调试与验证',
    summary: '通过调试知识库、测试矩阵和迭代计划保证实现可持续落地。'
  }
];

export const ACTIVE_DOCS: ActiveDocMeta[] = [
  {
    order: 0,
    path: 'doc/开发文档/00-开发总览.md',
    navLabel: '开发总览',
    shortTitle: '开发总览',
    summary: '统一站点目标、阅读顺序、术语约定和非目标。',
    sectionId: 'foundation'
  },
  {
    order: 1,
    path: 'doc/开发文档/01-统一需求分析.md',
    navLabel: '统一需求分析',
    shortTitle: '统一需求分析',
    summary: '把用户、问题、范围、成功标准收口到一份需求分析中。',
    sectionId: 'foundation'
  },
  {
    order: 2,
    path: 'doc/开发文档/02-AI自主学习闭环设计.md',
    navLabel: '学习闭环',
    shortTitle: 'AI自主学习闭环设计',
    summary: '定义建档、诊断、练习、风险判定、学习计划与复习回流。',
    sectionId: 'learning-loop'
  },
  {
    order: 3,
    path: 'doc/开发文档/03-总体架构设计.md',
    navLabel: '总体架构',
    shortTitle: '总体架构设计',
    summary: '统一描述前端、后端、腾讯平台、知识检索和观测体系。',
    sectionId: 'architecture'
  },
  {
    order: 4,
    path: 'doc/开发文档/04-前端架构设计.md',
    navLabel: '前端设计',
    shortTitle: '前端架构设计',
    summary: '说明导航、页面流、学习过程展示与调试入口。',
    sectionId: 'architecture'
  },
  {
    order: 5,
    path: 'doc/开发文档/05-后端架构设计.md',
    navLabel: '后端设计',
    shortTitle: '后端架构设计',
    summary: '定义服务拆分、风险判定、计划生成、ADP 适配和观测。',
    sectionId: 'architecture'
  },
  {
    order: 6,
    path: 'doc/开发文档/06-腾讯智能体开发平台集成设计.md',
    navLabel: '腾讯平台集成',
    shortTitle: '腾讯智能体开发平台集成设计',
    summary: '说明应用模式、工作流编排、多智能体协作与接口接入。',
    sectionId: 'integration'
  },
  {
    order: 7,
    path: 'doc/开发文档/07-数据对象与接口约定.md',
    navLabel: '数据与接口',
    shortTitle: '数据对象与接口约定',
    summary: '统一中文对象、中文字段、事件回流与外部接口映射。',
    sectionId: 'integration'
  },
  {
    order: 8,
    path: 'doc/开发文档/08-调试知识库设计.md',
    navLabel: '调试知识库',
    shortTitle: '调试知识库设计',
    summary: '明确高等数学知识库只承担调试、联调和回归职责。',
    sectionId: 'validation'
  },
  {
    order: 9,
    path: 'doc/开发文档/09-测试验证与迭代计划.md',
    navLabel: '测试与迭代',
    shortTitle: '测试验证与迭代计划',
    summary: '整理验收标准、测试矩阵、回归方式和后续扩科计划。',
    sectionId: 'validation'
  }
];

export const ACTIVE_DOC_PATHS = ACTIVE_DOCS.map((item) => item.path);

export const ACTIVE_DOC_BY_PATH = new Map(ACTIVE_DOCS.map((item) => [item.path, item]));
export const ACTIVE_DOC_BY_SECTION = new Map(
  ACTIVE_DOC_SECTIONS.map((section) => [
    section.id,
    ACTIVE_DOCS.filter((item) => item.sectionId === section.id)
  ])
);

export const ARCHIVE_GROUP_ORDER = ['历史文档', '腾讯资料', '比赛资料', '技术参考', '图像资源'] as const;

export type ArchiveGroup = (typeof ARCHIVE_GROUP_ORDER)[number];
