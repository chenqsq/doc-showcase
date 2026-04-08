# AI主导学习生命周期的自进化自学智能体平台接口与 API 说明

> 文档层级：作品主文档  
> 文档目的：定义前后端、智能体群和后台使用的公开对象与接口分组  
> 核心结论：接口不再围绕教师侧查询设计，而是围绕“选科开学、地图生成、闯关推进、画像更新、笔记沉淀、资料进化”组织

## 1. 接口原则

- 前端只消费结构化对象，不直接拼装复杂业务状态
- 流式讲解统一走 `HTTP SSE V2`
- 地图重规划必须有显式事件对象，不允许只返回一段文字解释
- 资料入库必须有完整任务状态和演化记录
- 支持学生主线与后台主线共用一套主数据

## 2. 基础约定

| 项目 | 约定 |
| --- | --- |
| 基础协议 | `HTTPS + JSON` |
| 流式协议 | `HTTP SSE V2` |
| 鉴权方式 | 后端会话 / 后台 Token / 评委访问凭证 |
| 时间格式 | `ISO-8601` |
| 主键风格 | 业务主键 + UUID 组合均可，但对象引用必须稳定 |

## 3. 核心对象

| 对象 | 核心字段 |
| --- | --- |
| `科目选择记录` | `selectionId`、`subjects[]`、`priorityMode` |
| `学习启动会话` | `startupSessionId`、`studentId`、`selectedSubjects[]`、`activeSubjectId` |
| `AI学习地图` | `mapId`、`subjectId`、`stages[]`、`currentNodeId`、`recommendedNextNodeId` |
| `地图节点` | `nodeId`、`nodeType`、`title`、`status`、`bossFlag`、`returnToNodeId` |
| `重规划事件` | `eventId`、`triggerType`、`summary`、`actions[]`、`returnCondition` |
| `闯关学习任务` | `taskId`、`nodeId`、`goal`、`passCriteria`、`difficulty` |
| `学习画像` | `profileId`、`mastery`、`weakFoundations[]`、`errorPatterns[]`、`pacePreference` |
| `成长反馈事件` | `feedbackId`、`passed`、`masteryDelta`、`abilityDelta[]`、`unlocks[]` |
| `复习笔记包` | `notePackId`、`mindMapUrl`、`structuredNotes[]`、`reviewPlan[]` |
| `知识注入任务` | `ingestionTaskId`、`status`、`sources[]`、`assetPackId` |
| `知识资产包` | `assetPackId`、`subjectId`、`assets[]`、`impactSummary` |
| `知识演化记录` | `evolutionId`、`assetPackId`、`version`、`changedNodes[]` |
| `策略快照` | `strategyId`、`mapPlannerVersion`、`feedbackPolicyVersion`、`updatedAt` |

## 4. 接口分组

### 4.1 选科与开学

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/startup/subjects` | `GET` | 查询可选科目列表 |
| `/startup/select` | `POST` | 提交单科或多科选择 |
| `/startup/session` | `POST` | 创建学习启动会话 |
| `/startup/resume` | `GET` | 查询最近可续学记录 |

### 4.2 学习地图生成与短诊断

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/maps/{subjectId}/initial` | `POST` | 生成初始学习地图 |
| `/maps/{subjectId}` | `GET` | 查询当前学习地图 |
| `/diagnostics/{subjectId}/start` | `POST` | 启动短诊断 |
| `/diagnostics/{subjectId}/submit` | `POST` | 提交短诊断结果并触发重排 |

### 4.3 实时地图状态与重规划事件

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/maps/{subjectId}/current-node` | `GET` | 查询当前节点 |
| `/maps/{subjectId}/events` | `GET` | 查询最近重规划事件 |
| `/maps/{subjectId}/recommendation` | `GET` | 查询推荐下一步 |
| `/maps/{subjectId}/reroute-explain/{eventId}` | `GET` | 查询某次重规划的完整原因 |

### 4.4 闯关学习会话

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/learning/tasks/{taskId}` | `GET` | 查询当前关卡任务 |
| `/learning/sessions` | `POST` | 创建闯关学习会话 |
| `/learning/sessions/{sessionId}/stream` | `POST` | 流式讲解、追问和引导 |

### 4.5 作答评分与画像更新

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/learning/sessions/{sessionId}/answers` | `POST` | 提交作答 |
| `/learning/sessions/{sessionId}/feedback` | `GET` | 查询本次成长反馈事件 |
| `/profiles/{studentId}` | `GET` | 查询当前学习画像 |
| `/profiles/{studentId}/history` | `GET` | 查询画像变化历史 |

### 4.6 笔记 / 思维导图 / 复习计划

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/notes/{studentId}` | `GET` | 查询复习笔记包列表 |
| `/notes/{studentId}/{notePackId}` | `GET` | 查询某次笔记详情 |
| `/mindmaps/{studentId}/{notePackId}` | `GET` | 查询思维导图资源 |
| `/reviews/{studentId}/schedule` | `GET` | 查询复习计划 |

### 4.7 资料注入与自动入库

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/ingestion/upload` | `POST` | 上传资料 |
| `/ingestion/tasks/{taskId}` | `GET` | 查询识别与入库状态 |
| `/assets/{assetPackId}` | `GET` | 查询知识资产包 |
| `/evolutions/{subjectId}` | `GET` | 查询知识演化记录 |

### 4.8 系统自治与策略分析

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/ops/agents/status` | `GET` | 查询 Agent 协同状态 |
| `/ops/strategies/latest` | `GET` | 查询最新策略快照 |
| `/ops/reroutes/logs` | `GET` | 查询重规划日志 |
| `/ops/audit/evolutions/{evolutionId}/rollback` | `POST` | 回滚某次知识演化 |

## 5. 验收口径

- 能跑通 `选科 -> 开学 -> 地图生成 -> 诊断校准 -> 当前关卡 -> 作答 -> 反馈 -> 画像更新`
- 能查询某次 `重规划事件` 的原因和回主线条件
- 能查询 `思维导图` 和 `结构化笔记`
- 能查询 `知识注入任务`、`知识资产包` 和 `知识演化记录`
- 能同时支持多科并行时的地图与画像查询
