const n=`# AI主导学习平台-知识库结构与契约\r
\r
> 文档层级：平台层  \r
> 文档目的：统一定义平台知识库的分层方式、知识版本契约、检索边界与更新流程  \r
> 核心结论：平台知识库不是“把资料都扔进 RAG”，而是按 \`raw / candidate / main / archive\` 四区治理、按统一字段约束、按 Git 化补丁和提交长期演化\r
\r
## 与其他文档的边界\r
\r
本文只负责回答：\r
\r
- 平台知识库分几层、分几区\r
- 正式知识资产必须带哪些字段\r
- 新资料怎样从原始素材走到可发布主知识\r
- 学生主线和后台预览怎样检索不串区\r
\r
本文不重新定义平台角色本体、不展开某门课的章节细节，也不替代某个 Agent 的提示词。\r
\r
## 1. 一句话先记住\r
\r
> 知识库真正要解决的不是“能不能回答”，而是“回答是否命中正确课程、正确章节、正确知识版本，并且能持续被维护、发布和回滚”。\r
\r
## 2. 平台知识库的两层结构\r
\r
### 2.1 内容层\r
\r
| 层级 | 说明 |\r
| --- | --- |\r
| 平台知识库 | 平台规则、对象契约、接入规范、ADP 配置说明 |\r
| 学科教学知识库 | 课程总览、章节导学、知识点卡、例题卡、练习答案、错题卡、笔记资产 |\r
| 交付资料库 | 比赛口径、演示脚本、答辩资料 |\r
\r
### 2.2 版本层\r
\r
| 知识区 | 说明 |\r
| --- | --- |\r
| \`raw\` | 原始资料与 OCR 中间结果 |\r
| \`candidate\` | 候选知识区 |\r
| \`main\` | 主教学知识区 |\r
| \`archive\` | 归档与回滚区 |\r
\r
## 3. 正式文档类型\r
\r
| 文档类型 | 放在哪一层 | 是否进入学生主检索 |\r
| --- | --- | --- |\r
| 课程总览 | 学科教学知识库 | 是 |\r
| 章节导学 | 学科教学知识库 | 是 |\r
| 知识点卡 | 学科教学知识库 | 是 |\r
| 例题讲解卡 | 学科教学知识库 | 是 |\r
| 练习与标准答案 | 学科教学知识库 | 是 |\r
| 错题与误区卡 | 学科教学知识库 | 是 |\r
| 结构化笔记 | 学科教学知识库 | 是 |\r
| 思维导图资源 | 学科教学知识库 | 是 |\r
| 平台规则文档 | 平台知识库 | 否 |\r
| ADP 配置说明 | 平台知识库 | 否 |\r
| 比赛口径与演示稿 | 交付资料库 | 否 |\r
\r
## 4. 字段契约\r
\r
### 4.1 正式元数据字段\r
\r
| 中文字段名 | 英文字段键 | 含义 |\r
| --- | --- | --- |\r
| 学科大类 | \`subject_category\` | 当前资产归属的大类 |\r
| 课程编号 | \`course_id\` | 当前课程正式标识 |\r
| 模块编号 | \`module_id\` | 课程模块边界 |\r
| 章节编号 | \`chapter_id\` | 当前章节正式标识 |\r
| 知识点编号 | \`knowledge_point_id\` | 当前资产主服务的知识点 |\r
| 资源类型 | \`resource_type\` | 文档属于哪种知识资产 |\r
| 难度 | \`difficulty\` | 资源适用层级 |\r
| 来源类型 | \`source_type\` | 当前文档从什么素材加工而来 |\r
| 来源等级 | \`source_grade\` | \`A/B/C\` 来源可信度等级 |\r
| 版本号 | \`version\` | 当前资产版本 |\r
| 发布通道 | \`publish_channel\` | \`raw/candidate/main/archive\` |\r
| 可信度分数 | \`confidence_score\` | 当前条目可信度 |\r
| 冲突等级 | \`conflict_level\` | \`none/soft/hard\` |\r
| 基线提交 | \`base_commit_id\` | 当前版本基于哪个提交演化 |\r
\r
### 4.2 运行时字段\r
\r
| 中文字段名 | 英文字段键 | 用途 |\r
| --- | --- | --- |\r
| 学生标识 | \`VisitorId\` | 锁定用户级连续性 |\r
| 学习会话 | \`ConversationId\` | 锁定本轮学习流 |\r
| 自定义变量 | \`custom_variables.*\` | 传递课程、节点、风险、知识范围 |\r
| 长期摘要记忆 | \`SYS.Memory\` | 只存画像摘要，不存业务真状态 |\r
\r
## 5. 检索边界\r
\r
### 5.1 学生正式检索\r
\r
学生正式检索默认锁定：\r
\r
- \`subject_category\`\r
- \`course_id\`\r
- \`chapter_id\`\r
- \`publish_channel=main\`\r
\r
### 5.2 后台预览检索\r
\r
后台预览检索可以额外读取：\r
\r
- \`publish_channel=candidate\`\r
- 冲突说明\r
- 校验报告\r
- 影响域摘要\r
\r
### 5.3 运行时原则\r
\r
- \`candidate\` 可以参与后台预览和低风险参考\r
- \`main\` 才能参与正式学习地图、评分标准和关卡通过条件\r
- \`raw\` 和 \`archive\` 不进入学生正式检索\r
\r
## 6. Git 化知识演化模型\r
\r
### 6.1 核心对象\r
\r
- \`KnowledgePatch\`\r
- \`KnowledgeCandidate\`\r
- \`KnowledgeConflict\`\r
- \`KnowledgeCommit\`\r
- \`KnowledgeRelease\`\r
- \`KnowledgeRollback\`\r
- \`ValidationReport\`\r
- \`EvidenceBundle\`\r
\r
### 6.2 正式流程\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A[原始资料 raw] --> B[解析与切分]\r
    B --> C[声明抽取]\r
    C --> D[KnowledgePatch]\r
    D --> E[ValidationReport]\r
    E --> F[candidate]\r
    E --> G[archive]\r
    F --> H[KnowledgeCommit]\r
    H --> I[KnowledgeRelease]\r
    I --> J[main]\r
\`\`\`\r
\r
### 6.3 门禁规则\r
\r
- 高可信且无硬冲突：允许进入 \`main\`\r
- 中等可信或存在软冲突：停留在 \`candidate\`\r
- 低可信或存在硬冲突：进入 \`archive\`\r
\r
## 7. ADP V1 映射方式\r
\r
当前平台在腾讯 ADP 的第一版默认采用：\r
\r
- 当前应用：\`AI教师智能体\`\r
- 当前主协同：\`Multi-Agent + 工作流编排\`\r
- 当前主接入：\`HTTP SSE V2\`\r
- 当前知识读取：主教学读 \`main\`，后台预览可读 \`candidate\`\r
\r
V1 不额外引入自建 RAG 底座，但知识版本真源必须在平台外部维护。\r
\r
## 8. 文档生命周期\r
\r
1. 采集原始素材\r
2. 解析与切分\r
3. 声明抽取\r
4. 可信度与冲突判断\r
5. 进入候选区\r
6. 合并发布\r
7. 影响域重算\r
8. 回滚与归档\r
\r
## 9. 验收标准\r
\r
知识库结构成立至少要同时满足：\r
\r
- 学生提问不会串到别的课程\r
- 正式学习链路只命中 \`main\`\r
- 新资料可以进入候选区而不污染主教学区\r
- 文档更新后能追溯版本、提交和回滚\r
- 受影响地图节点能局部重算，不会全库重建\r
`;export{n as default};
