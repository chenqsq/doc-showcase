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
    label: '总览与需求',
    summary: '先统一作品定义、比赛交付边界和需求范围，再进入场景与页面设计。'
  },
  {
    id: 'experience',
    label: '场景与体验',
    summary: '围绕课堂重构、学生伴学、错题复练和教师洞察建立页面与交互链路。'
  },
  {
    id: 'architecture',
    label: '架构与实现',
    summary: '统一描述技术选型、算法设计、知识库结构和接口对接。'
  },
  {
    id: 'delivery',
    label: '交付与答辩',
    summary: '收口测试、PPT、视频、访问手册与开发技术文档，直接对应比赛交付。'
  }
];

export const ACTIVE_DOCS: ActiveDocMeta[] = [
  {
    order: 0,
    path: 'doc/作品文档/00-作品总览与阅读地图.md',
    navLabel: '作品总览',
    shortTitle: '作品总览与阅读地图',
    summary: '统一作品名、交付边界、阅读顺序和比赛材料映射。',
    sectionId: 'overview'
  },
  {
    order: 1,
    path: 'doc/作品文档/01-PRD与需求分析.md',
    navLabel: 'PRD',
    shortTitle: 'PRD 与需求分析',
    summary: '定义产品定位、角色范围、功能需求与成功标准。',
    sectionId: 'overview'
  },
  {
    order: 2,
    path: 'doc/作品文档/02-场景与用户流程.md',
    navLabel: '场景流程',
    shortTitle: '场景与用户流程',
    summary: '把上传、重构、伴学、复练、洞察串成标准演示链路。',
    sectionId: 'experience'
  },
  {
    order: 3,
    path: 'doc/作品文档/03-页面与交互设计.md',
    navLabel: '页面设计',
    shortTitle: '页面与交互设计',
    summary: '定义六个核心工作台页面、状态与评委演示点。',
    sectionId: 'experience'
  },
  {
    order: 4,
    path: 'doc/作品文档/04-总体架构与技术选型.md',
    navLabel: '总体架构',
    shortTitle: '总体架构与技术选型',
    summary: '固定 Vue + Go 单体 + ADP 的比赛版整体架构。',
    sectionId: 'architecture'
  },
  {
    order: 5,
    path: 'doc/作品文档/05-算法与知识库设计.md',
    navLabel: '算法知识库',
    shortTitle: '算法与知识库设计',
    summary: '定义知识重构、任务规划、掌握度、错题画像与群体洞察。',
    sectionId: 'architecture'
  },
  {
    order: 6,
    path: 'doc/作品文档/06-接口与API说明.md',
    navLabel: '接口 API',
    shortTitle: '接口与 API 说明',
    summary: '定义 REST + SSE 混合接口、上下文字段与公开对象。',
    sectionId: 'architecture'
  },
  {
    order: 7,
    path: 'doc/作品文档/07-测试验证与预期效果.md',
    navLabel: '测试验证',
    shortTitle: '测试验证与预期效果',
    summary: '建立比赛覆盖矩阵、标准链路验收和术语一致性检查。',
    sectionId: 'delivery'
  },
  {
    order: 8,
    path: 'doc/作品文档/08-答辩PPT大纲.md',
    navLabel: '答辩 PPT',
    shortTitle: '答辩 PPT 大纲',
    summary: '提供 16 页左右的答辩结构与讲述重点。',
    sectionId: 'delivery'
  },
  {
    order: 9,
    path: 'doc/作品文档/09-演示视频脚本.md',
    navLabel: '视频脚本',
    shortTitle: '演示视频脚本',
    summary: '提供 3 分钟内的视频镜头顺序、口播与字幕建议。',
    sectionId: 'delivery'
  },
  {
    order: 10,
    path: 'doc/作品文档/10-访问与评测手册.md',
    navLabel: '访问手册',
    shortTitle: '访问与评测手册',
    summary: '说明访问入口、账号权限、评委体验步骤与异常处理。',
    sectionId: 'delivery'
  },
  {
    order: 11,
    path: 'doc/作品文档/11-开发技术文档.md',
    navLabel: '技术文档',
    shortTitle: '开发技术文档',
    summary: '收口平台选择、关键实现、部署方式与二次开发指引。',
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

export const ARCHIVE_GROUP_ORDER = ['技术真源', '历史实现', '腾讯资料', '比赛资料', '技术参考', '图像资源'] as const;

export type ArchiveGroup = (typeof ARCHIVE_GROUP_ORDER)[number];
