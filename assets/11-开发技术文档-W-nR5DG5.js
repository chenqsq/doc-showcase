const n=`\uFEFF# AI主导学习生命周期的自进化自学智能体平台开发技术文档\r
\r
> 文档层级：作品主文档  \r
> 文档目的：说明平台选择、关键实现、部署方式和二次开发边界  \r
> 核心结论：比赛版技术实现遵循“单体清晰、结构稳定、AI 友好维护、能力可持续演进”的原则\r
\r
## 1. 技术栈总览\r
\r
### 前端\r
\r
- \`Vue 3\`\r
- \`TypeScript\`\r
- \`Vite\`\r
- \`Vue Router\`\r
- \`Pinia\`\r
- \`Naive UI\`\r
- \`Tailwind CSS\`\r
- \`VueUse Motion\`\r
- \`ECharts\`\r
\r
### 后端\r
\r
- \`Go 1.24\`\r
- \`Gin\`\r
- \`pgx + sqlc\`\r
- \`PostgreSQL 16\`\r
- \`腾讯 COS / MinIO\`\r
- \`腾讯 ADP + HTTP SSE V2\`\r
\r
## 2. 核心模块\r
\r
| 模块 | 负责什么 |\r
| --- | --- |\r
| 启动与选科模块 | 选科、多科优先级、学习启动会话 |\r
| 学习地图模块 | 生成、查询、节点状态、重规划事件 |\r
| 闯关学习模块 | 讲解、作答、评分、反馈、推进 |\r
| 学习画像模块 | 增量更新画像和成长曲线 |\r
| 笔记模块 | 生成思维导图、结构化笔记和复习计划 |\r
| 资料注入模块 | 识别、切分、标注、入库、演化记录 |\r
| 自治分析模块 | Agent 状态、策略快照、日志和审计 |\r
\r
## 3. Agent 群实现建议\r
\r
| Agent | 最小职责 |\r
| --- | --- |\r
| \`StarterAgent\` | 生成初始地图 |\r
| \`DiagnosisAgent\` | 执行短诊断 |\r
| \`MapPlannerAgent\` | 负责地图重规划 |\r
| \`TutorAgent\` | 负责讲解和引导 |\r
| \`EvaluatorAgent\` | 负责评分和成长反馈 |\r
| \`ProfileAgent\` | 负责画像更新 |\r
| \`NoteSynthAgent\` | 负责笔记和思维导图 |\r
| \`IngestionAgent\` | 负责资料识别和入库 |\r
| \`StrategyAgent\` | 负责策略快照和日志分析 |\r
\r
## 4. 部署建议\r
\r
### 单机结构\r
\r
- 1 个 Vue 前端静态站点\r
- 1 个 Go 单体服务\r
- 1 个 PostgreSQL 数据库\r
- 1 个 COS / MinIO 文件存储\r
\r
### 运行建议\r
\r
- 使用 \`Caddy / Nginx\` 反向代理\r
- 使用 \`systemd\` 守护 Go 服务\r
- 保留数据库备份和恢复脚本\r
- 为流式接口和后台任务保留健康检查\r
\r
## 5. 二次开发边界\r
\r
### 允许扩展\r
\r
- 新学科接入\r
- 多科排程策略增强\r
- 地图样式与动画升级\r
- 新的画像字段\r
- 新的笔记生成模板\r
\r
### 当前不前置\r
\r
- 微服务拆分\r
- Redis / MQ\r
- 自动微调底层模型\r
- 重游戏引擎式前端\r
\r
## 6. 对照真源\r
\r
- [AI主导学习平台-总体架构设计.md](../智能体文档/平台层/AI主导学习平台-总体架构设计.md)\r
- [AI主导学习平台-统一对象与接口契约.md](../智能体文档/平台层/AI主导学习平台-统一对象与接口契约.md)\r
- [AI教师智能体群引擎-技术方案.md](../智能体文档/子引擎层/AI教师智能体群引擎-技术方案.md)\r
\r
`;export{n as default};
