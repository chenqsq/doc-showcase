const n=`# AI教师智能体群引擎 技术方案\r
\r
> 文档层级：子引擎层  \r
> 文档目的：说明智能体群的职责拆分、工作流协作、资料治理和平台接入方式  \r
> 核心结论：技术方案重点不是堆模型，而是让地图生成、教学推进、画像更新、笔记沉淀和资料治理稳定协同\r
\r
## 1. Agent 角色\r
\r
| Agent | 职责 | 主要输出 |\r
| --- | --- | --- |\r
| \`StarterAgent\` | 生成初始地图 | \`AI学习地图\` |\r
| \`DiagnosisAgent\` | 执行短诊断 | \`重规划事件\` |\r
| \`MapPlannerAgent\` | 学习中重规划地图 | 新节点与回主线条件 |\r
| \`TutorAgent\` | 讲解与引导 | 流式教学内容 |\r
| \`EvaluatorAgent\` | 评分与成长反馈 | \`成长反馈事件\` |\r
| \`ProfileAgent\` | 画像更新 | \`学习画像\` |\r
| \`NoteSynthAgent\` | 思维导图与结构化笔记 | \`复习笔记包\` |\r
| \`IngestionAgent\` | 资料识别、声明抽取和补丁生成 | \`KnowledgePatch\` |\r
| \`StrategyAgent\` | 策略快照、影响分析和发布记录 | \`策略快照\` |\r
\r
## 2. 工作流主链\r
\r
### 2.1 学生主链\r
\r
\`选科 -> StarterAgent -> DiagnosisAgent -> MapPlannerAgent -> TutorAgent -> EvaluatorAgent -> ProfileAgent -> NoteSynthAgent\`\r
\r
### 2.2 资料治理链\r
\r
\`上传资料 -> IngestionAgent -> ValidationReport -> candidate -> KnowledgeCommit -> main -> StrategyAgent\`\r
\r
## 3. 输入与输出约束\r
\r
### 3.1 正式输入\r
\r
每个 Agent 默认只能读到自己需要的最小上下文：\r
\r
- 当前地图局部视图\r
- 当前任务卡\r
- 学习画像摘要\r
- 最近必要交互\r
- 当前知识检索片段\r
\r
### 3.2 正式输出\r
\r
下列输出必须结构化，而不是只返回自然语言：\r
\r
- 评分结果\r
- 重规划事件\r
- 画像更新结果\r
- 笔记元信息\r
- 资料补丁与校验报告\r
\r
## 4. 结构化输出要求\r
\r
| Agent | 必须输出什么 |\r
| --- | --- |\r
| \`StarterAgent\` | 地图骨架、阶段与初始推荐节点 |\r
| \`DiagnosisAgent\` | 诊断结论、风险等级、调整建议 |\r
| \`MapPlannerAgent\` | \`ReplanEvent\`、插入节点、回主线条件 |\r
| \`EvaluatorAgent\` | 结构化评分、错因标签、掌握度变化 |\r
| \`ProfileAgent\` | 画像增量字段与阶段归并结果 |\r
| \`NoteSynthAgent\` | 笔记标题、摘要、思维导图资源元信息 |\r
| \`IngestionAgent\` | \`KnowledgePatch\`、\`EvidenceBundle\`、建议发布范围 |\r
| \`StrategyAgent\` | 影响域、发布建议、回滚建议 |\r
\r
## 5. 资料治理子工作流\r
\r
### 5.1 正式步骤\r
\r
1. 资料解析与切分\r
2. 知识声明抽取\r
3. 可信度判断\r
4. 冲突判断\r
5. 进入候选区\r
6. 合并发布\r
7. 影响域重算\r
\r
### 5.2 引擎内部分工\r
\r
- \`IngestionAgent\` 不直接把资料写成主知识\r
- \`StrategyAgent\` 负责结合现有主干知识判断影响范围\r
- 最终知识落库、提交和回滚由外部服务执行\r
\r
## 6. 关键约束\r
\r
- \`MapPlannerAgent\` 只负责给出重规划建议，最终落库由外部服务完成\r
- \`EvaluatorAgent\` 必须输出结构化评分，不只输出自然语言\r
- \`ProfileAgent\` 必须在学习中和学习后都更新画像\r
- \`NoteSynthAgent\` 在单关结束、一轮结束、阶段结束都可产出笔记资产\r
- \`IngestionAgent\` 只负责识别、归类、结构化建议，不直接替代知识版本管理\r
\r
## 7. 失败与降级策略\r
\r
| 场景 | 降级策略 |\r
| --- | --- |\r
| 流式讲解异常 | 回退到静态讲解摘要与下一步建议 |\r
| 某个 Agent 输出不稳定 | 保留最近一次结构化稳定结果 |\r
| 资料解析失败 | 停留在 \`raw\` 并返回失败原因 |\r
| 冲突无法消解 | 留在 \`candidate\`，不进入 \`main\` |\r
| 发布后发现问题 | 通过 \`KnowledgeRollback\` 回滚到前一提交 |\r
\r
## 8. 读完后你应该带走什么\r
\r
- 这套引擎不是一个“大聊天框”，而是多 Agent 协作的教学与知识治理运行时。\r
- 引擎负责推理和协作，不负责替代业务数据库。\r
- 资料入库必须先过校验、冲突和门禁，不能直接污染主教学知识区。\r
`;export{n as default};
