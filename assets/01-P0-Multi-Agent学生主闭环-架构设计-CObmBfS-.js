const n=`# P0 Multi-Agent 学生主闭环架构设计（AI教师版）\r
\r
> 版本：v1.0  \r
> 文档属性：阶段架构版（P0）  \r
> 目标：只讲一期必交付主架构  \r
> 主线能力：\`Multi-Agent + 工作流编排 + 知识库 + 长期记忆 + 官方发布链接\`\r
\r
---\r
\r
## 目录\r
\r
1. 一页结论\r
2. P0 目标与范围边界\r
3. P0 系统上下文图\r
4. P0 Agent 编排图\r
5. P0 知识库、变量与记忆流转图\r
6. P0 运行流程图\r
7. P0 发布与访问图\r
8. P0 异常兜底图\r
9. 组件职责表\r
10. 验收与演示建议\r
11. 官方依据\r
\r
---\r
\r
## 1. 一页结论\r
\r
\`P0\` 只回答一个问题：\r
\r
\`怎么先把 AI 教师学生主闭环稳定跑通。\`\r
\r
这一阶段不追求大而全，只追求三件事：\r
\r
- 学生提问后，系统能稳定完成 \`诊断 -> 讲解 -> 练习 -> 测评 -> 复盘\`。\r
- 回答基于课程资料，而不是通用闲聊。\r
- 发布后评委可以通过 ADP 官方入口实际体验。\r
\r
P0 的架构关键词：\r
\r
- \`TeacherOrchestrator\`\r
- \`DiagnosisAgent\`\r
- \`ExplanationAgent\`\r
- \`PracticeEvalAgent\`\r
- \`ReviewPlanAgent\`\r
- \`知识库\`\r
- \`visitor_biz_id\`\r
- \`custom_variables\`\r
- \`SYS.Memory\`\r
\r
---\r
\r
## 2. P0 目标与范围边界\r
\r
### 2.1 P0 要做什么\r
\r
- 跑通学生侧主闭环。\r
- 建立课程知识对齐能力。\r
- 建立长期记忆和课程隔离能力。\r
- 提供可访问发布版本。\r
\r
### 2.2 P0 不做什么\r
\r
- 不把 \`TeacherOpsAgent\` 写进阻塞主链路。\r
- 不把教师轻看板当成一期前提。\r
- 不引入产品后端、Redis、MQ。\r
- 不要求自定义前端才能演示。\r
\r
---\r
\r
## 3. P0 系统上下文图（图 1）\r
\r
\`\`\`mermaid\r
flowchart LR\r
    S["学生"] --> E["ADP 已发布应用"]\r
    S --> I["图片 / 文本 / 语音 / 文档输入"]\r
    I --> E\r
\r
    E --> W["Multi-Agent 工作流"]\r
    W --> K["课程知识库"]\r
    W --> M["SYS.Memory"]\r
    E --> P["官方发布链接 / 分享链接"]\r
\`\`\`\r
\r
这张图想说明什么：\r
\r
- P0 的核心系统边界完全可以放在 ADP 内完成。\r
- 学生通过平台入口发起请求，不需要先自建前端。\r
- 知识库和长期记忆是主闭环的关键底座。\r
\r
---\r
\r
## 4. P0 Agent 编排图（图 2）\r
\r
\`\`\`mermaid\r
flowchart TD\r
    A["学生请求"] --> B["TeacherOrchestrator"]\r
    B --> C["DiagnosisAgent"]\r
    C --> D["ExplanationAgent"]\r
    D --> E["PracticeEvalAgent"]\r
    E --> F{"是否达标"}\r
    F -->|否| D\r
    F -->|是| G["ReviewPlanAgent"]\r
    G --> H["主控汇总并回复学生"]\r
\`\`\`\r
\r
这张图想说明什么：\r
\r
- \`TeacherOrchestrator\` 是调度入口，但真正的教学环节由子 Agent 分工完成。\r
- 主链路不是一问一答，而是一条可循环的教学流程。\r
- 如果学生没达标，允许返回讲解或继续练习。\r
\r
### 4.1 为什么 P0 不让 \`TeacherOpsAgent\` 进主链路\r
\r
- 因为 P0 的目标是先保证学生侧闭环稳定。\r
- 教师运营属于增强能力，应该在主闭环稳定后再叠加。\r
- 所以 P0 文档里只把 \`TeacherOpsAgent\` 视为后续阶段预留。\r
\r
---\r
\r
## 5. P0 知识库、变量与记忆流转图（图 3）\r
\r
\`\`\`mermaid\r
flowchart LR\r
    U["学生请求"] --> A["统一上下文字段"]\r
    A --> A1["visitor_biz_id"]\r
    A --> A2["course_id"]\r
    A --> A3["class_id"]\r
    A --> A4["chapter_id"]\r
    A --> A5["role"]\r
\r
    A --> W["P0 工作流"]\r
    W --> G["各教学 Agent"]\r
    G --> K["课程知识库检索"]\r
    G --> M["SYS.Memory 命中"]\r
    G --> O["主控汇总输出"]\r
\`\`\`\r
\r
这张图想说明什么：\r
\r
- P0 的连续学习能力依赖 \`visitor_biz_id\`。\r
- P0 的课程隔离能力依赖 \`course_id / class_id / chapter_id / role\`。\r
- 这些字段不会只在接口层用一次，而是会贯穿工作流、检索、记忆三处。\r
\r
### 5.1 P0 固定字段约定\r
\r
| 字段 | 用途 | 是否一期必须 |\r
| --- | --- | --- |\r
| \`visitor_biz_id\` | 终端学生唯一标识 | 是 |\r
| \`course_id\` | 课程边界控制 | 是 |\r
| \`class_id\` | 班级边界控制 | 建议 |\r
| \`chapter_id\` | 章节边界控制 | 建议 |\r
| \`role\` | 学生/教师角色识别 | 建议 |\r
\r
---\r
\r
## 6. P0 运行流程图（图 4）\r
\r
\`\`\`mermaid\r
flowchart TD\r
    A["学生提问 / 拍题 / 上传资料"] --> B["多模态解析"]\r
    B --> C["TeacherOrchestrator 判断任务类型"]\r
    C --> D["DiagnosisAgent 学习诊断"]\r
    D --> E["ExplanationAgent 分层讲解"]\r
    E --> F["PracticeEvalAgent 引导练习与测评"]\r
    F --> G["ReviewPlanAgent 错因归因与学习计划"]\r
    G --> H["长期记忆更新"]\r
    H --> I["主控输出最终回复"]\r
\`\`\`\r
\r
这张图想说明什么：\r
\r
- P0 不是“先聊天再看情况”，而是固定教学闭环。\r
- 多模态解析只是入口，重点在后续的编排和教学输出。\r
- 最终输出不是单个 Agent 的原始结果，而是主控收束后的学生回复。\r
\r
---\r
\r
## 7. P0 发布与访问图（图 5）\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["P0 配置完成"] --> B["应用发布"]\r
    B --> C["服务状态"]\r
    C --> D["立即体验"]\r
    C --> E["分享链接 / 二维码"]\r
    C --> F["API 管理 / AppKey"]\r
\`\`\`\r
\r
这张图想说明什么：\r
\r
- P0 默认访问方式就是 ADP 官方发布链接。\r
- 这条路最稳，也最适合比赛第一版。\r
- \`AppKey\` 在 P0 只需要“知道有”，不要求马上接自定义前端。\r
\r
---\r
\r
## 8. P0 异常兜底图（图 6）\r
\r
\`\`\`mermaid\r
flowchart TD\r
    A["主链路执行中"] --> B{"异常类型"}\r
    B -->|低置信| C["降级为保守讲解 + 引导澄清"]\r
    B -->|检索不足| D["回退基础知识包 + 提示补充资料"]\r
    B -->|节点超时| E["工作流异常处理 / 重试"]\r
    B -->|整体不稳| F["退回 Standard 保底路线"]\r
    C --> G["保留主闭环"]\r
    D --> G\r
    E --> G\r
    F --> H["保留知识库 + 发布入口"]\r
\`\`\`\r
\r
这张图想说明什么：\r
\r
- P0 不是只设计成功路径，也要设计失败路径。\r
- 只要异常不致命，优先保持学生主闭环不中断。\r
- 如果主链路稳定性不够，允许退回 \`Standard\` 保住演示。\r
\r
---\r
\r
## 9. 组件职责表\r
\r
| 组件 | 输入 | 输出 | 关键约束 |\r
| --- | --- | --- | --- |\r
| \`TeacherOrchestrator\` | 学生问题、历史上下文、变量、长期记忆 | 最终教学回复、任务调度结果 | 唯一学生入口 |\r
| \`DiagnosisAgent\` | 当前问题、课程标签、记忆摘要 | 水平判断、卡点、建议路径 | 不直接面向学生 |\r
| \`ExplanationAgent\` | 诊断结果、检索片段 | 分层讲解、步骤说明、例子 | 回答要贴课程资料 |\r
| \`PracticeEvalAgent\` | 讲解结果、题库、学生作答 | 练习题、评分、达标判断 | 支持未达标回流 |\r
| \`ReviewPlanAgent\` | 错题、评分、知识点标签 | 错因归因、学习计划、复盘建议 | 输出进入记忆更新 |\r
| \`知识库\` | PPT、讲义、题库、FAQ | 检索片段 | 必须做课程标签隔离 |\r
| \`SYS.Memory\` | 多轮对话摘要 | 学生连续学习上下文 | 依赖 \`visitor_biz_id\` |\r
\r
---\r
\r
## 10. 验收与演示建议\r
\r
### 10.1 P0 验收门禁\r
\r
| 项 | 通过标准 |\r
| --- | --- |\r
| 主闭环 | 能完整跑通 \`诊断 -> 讲解 -> 练习 -> 测评 -> 复盘\` |\r
| 知识对齐 | 回答能命中课程资料 |\r
| 多模态 | 支持文本 / 图片 / 语音 / 文档输入 |\r
| 记忆连续 | 同一学生第二轮提问能延续上下文 |\r
| 发布可用 | 评委可通过官方发布入口访问 |\r
\r
### 10.2 P0 对应 FR 范围\r
\r
| 范围 | 对应内容 |\r
| --- | --- |\r
| \`FR-01 ~ FR-08\` | AI 教师策略、多模态理解、学习诊断、分层讲解、引导练习、形成性测评、错因归因、个性化学习计划 |\r
\r
### 10.3 P0 演示建议\r
\r
- 演示 1 门课、1 个章节、1 条端到端链路最稳。\r
- 展示顺序建议：拍题/提问 -> 诊断 -> 讲解 -> 练习 -> 判题 -> 复盘 -> 第二轮追问。\r
- 如果现场时间紧，就优先展示“主闭环 + 发布链接 + 记忆连续”。\r
\r
---\r
\r
## 11. 官方依据\r
\r
- 《什么是 Multi-Agent？》  \r
  https://cloud.tencent.com/document/product/1759/118325\r
- 《工作流编排》  \r
  https://cloud.tencent.com/document/product/1759/122556\r
- 《Agent 节点》  \r
  https://cloud.tencent.com/document/product/1759/122554\r
- 《知识检索相关设置》  \r
  https://cloud.tencent.com/document/product/1759/112704\r
- 《长期记忆说明》  \r
  https://cloud.tencent.com/document/product/1759/122458\r
- 《应用发布概述》  \r
  https://cloud.tencent.com/document/product/1759/104209\r
\r
`;export{n as default};
