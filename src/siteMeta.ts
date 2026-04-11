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
    id: 'overview',
    label: '作品总览',
    summary: '先看这是什么作品、面向谁、主闭环是什么，再进入详细设计。'
  },
  {
    id: 'experience',
    label: '体验与页面',
    summary: '看学生端、后台端分别怎么用，页面和流程怎样串成完整演示。'
  },
  {
    id: 'architecture',
    label: '技术实现',
    summary: '看前端、FastAPI、PostgreSQL、ADP 和知识库分别负责什么。'
  },
  {
    id: 'delivery',
    label: '答辩与交付',
    summary: '看测试、答辩、视频、评测和接手说明，直接对应比赛交付。'
  }
];

export const ACTIVE_DOCS: ActiveDocMeta[] = [
  {
    order: 0,
    path: 'doc/作品文档/00-作品总览与阅读地图.md',
    navLabel: '作品总览',
    shortTitle: '作品总览与阅读地图',
    summary: '5 分钟看懂作品定位、主闭环、当前进度和不同角色先看哪里。',
    sectionId: 'overview'
  },
  {
    order: 1,
    path: 'doc/作品文档/01-PRD与需求分析.md',
    navLabel: 'PRD',
    shortTitle: 'PRD 与需求分析',
    summary: '看作品解决什么问题、用户是谁、页面范围和验收标准是什么。',
    sectionId: 'overview'
  },
  {
    order: 2,
    path: 'doc/作品文档/02-场景与用户流程.md',
    navLabel: '场景流程',
    shortTitle: '场景与用户流程',
    summary: '把选科、诊断、闯关、补桥、复习和知识更新串成完整演示主线。',
    sectionId: 'experience'
  },
  {
    order: 3,
    path: 'doc/作品文档/03-页面与交互设计.md',
    navLabel: '页面设计',
    shortTitle: '页面与交互设计',
    summary: '看学生端和后台端分别有哪些页面、每个页面负责什么。',
    sectionId: 'experience'
  },
  {
    order: 4,
    path: 'doc/作品文档/04-总体架构与技术选型.md',
    navLabel: '总体架构',
    shortTitle: '总体架构与技术选型',
    summary: '确认 Vue 3、Python FastAPI、PostgreSQL、ADP 的分工和系统边界。',
    sectionId: 'architecture'
  },
  {
    order: 5,
    path: 'doc/作品文档/05-算法与知识库设计.md',
    navLabel: '算法知识库',
    shortTitle: '算法与知识库设计',
    summary: '看学习地图、补桥、画像、知识入库和演化规则如何成立。',
    sectionId: 'architecture'
  },
  {
    order: 6,
    path: 'doc/作品文档/06-接口与API说明.md',
    navLabel: '接口 API',
    shortTitle: '接口与 API 说明',
    summary: '看页面、后端和 ADP 之间要交换哪些对象、状态和接口。',
    sectionId: 'architecture'
  },
  {
    order: 7,
    path: 'doc/作品文档/07-测试验证与预期效果.md',
    navLabel: '测试验证',
    shortTitle: '测试验证与预期效果',
    summary: '看最小验收链路、专项验证点和通过标准怎么定义。',
    sectionId: 'delivery'
  },
  {
    order: 8,
    path: 'doc/作品文档/08-答辩PPT大纲.md',
    navLabel: '答辩 PPT',
    shortTitle: '答辩 PPT 大纲',
    summary: '看答辩时该怎么讲故事、怎么组织页面和技术证明。',
    sectionId: 'delivery'
  },
  {
    order: 9,
    path: 'doc/作品文档/09-演示视频脚本.md',
    navLabel: '视频脚本',
    shortTitle: '演示视频脚本',
    summary: '看 3 分钟视频应该怎么拍、怎么切镜头、怎么做降级预案。',
    sectionId: 'delivery'
  },
  {
    order: 10,
    path: 'doc/作品文档/10-访问与评测手册.md',
    navLabel: '访问手册',
    shortTitle: '访问与评测手册',
    summary: '看评委和测试同学怎样访问、体验和验收这套作品。',
    sectionId: 'delivery'
  },
  {
    order: 11,
    path: 'doc/作品文档/11-开发技术文档.md',
    navLabel: '技术文档',
    shortTitle: '开发技术文档',
    summary: '看当前展示站怎么启动，以及目标产品后续该怎么继续实现。',
    sectionId: 'delivery'
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

export const ARCHIVE_GROUP_ORDER = ['技术真源', '工程参考', '腾讯资料', '比赛资料', '技术参考', '图像资源'] as const;

export type ArchiveGroup = (typeof ARCHIVE_GROUP_ORDER)[number];
