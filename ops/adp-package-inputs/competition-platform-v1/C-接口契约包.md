# 输入包 C｜接口契约包

你现在接收的是“接口契约包”。  
请严格使用下面的核心对象名和边界，不要改写成模糊的自然语言概念。

## 1. 架构边界

目标架构固定为：

`前端 -> Python/FastAPI -> PostgreSQL + 腾讯 ADP + COS/MinIO`

职责分界：

- 前端：展示页面、发送动作、接收结构化对象、展示 SSE
- Python/FastAPI：代理 ADP、保存真状态、做门禁、做审计、做回滚
- PostgreSQL：保存学习状态、地图、画像、知识版本、审计记录
- 腾讯 ADP：负责 Agent 工作流、推理、流式讲解、知识检索、文档解析
- COS/MinIO：保存原始资料、导图、导出文件

## 2. 不可违背的边界

- 前端不能直接持有或调用 ADP 密钥
- ADP 不负责保存业务真状态
- 后端负责代理 SSE 给前端
- 地图变化必须体现为结构化事件对象，不允许只返回一段说明文字
- 知识入库必须经过 `candidate -> validation -> release/rollback`

## 3. 固定核心对象

请在生成结果中直接使用这些对象名：

| 对象名 | 含义 |
| --- | --- |
| `LearningSession` | 学习启动会话 |
| `LearningMap` | 学习地图 |
| `MapNode` | 地图节点 |
| `DiagnosticResult` | 短诊断结果 |
| `RerouteEvent` | 地图重规划事件 |
| `CheckpointAttempt` | 闯关作答记录 |
| `LearnerProfileSnapshot` | 学习画像快照 |
| `FeedbackEvent` | 成长反馈事件 |
| `NoteBundle` | 笔记与导图资产包 |
| `IngestionTask` | 资料入库任务 |
| `KnowledgePatch` | 知识补丁 |
| `ValidationReport` | 校验报告 |
| `KnowledgeRelease` | 知识发布 |
| `StrategySnapshot` | 策略快照 |

## 4. 地图节点状态与类型

### 节点状态

- `locked`
- `available`
- `current`
- `in_progress`
- `passed`
- `bridge_required`
- `review_due`
- `skipped`

### 节点类型

- `main`
- `bridge`
- `review`
- `challenge`
- `boss`
- `reward`

## 5. 知识治理状态

资料入库和知识治理至少要覆盖这些状态：

- `uploaded`
- `parsing`
- `extracted`
- `validating`
- `candidate`
- `released`
- `archived`
- `failed`

## 6. ADP 接入字段口径

请保持以下字段分工：

| 字段 | 用途 | 约束 |
| --- | --- | --- |
| `VisitorId` | 稳定用户标识 | 由后端映射，不直接暴露真实学生隐私 |
| `ConversationId` | 一次学习会话标识 | 与 `LearningSession` 关联 |
| `SYS.Memory` | 长期摘要记忆 | 只存偏好、薄弱点、错误模式等摘要 |
| `custom_variables` | 运行时业务变量 | 只传当前任务、节点、风险、范围等必要字段 |

## 7. 传给 ADP 的最小上下文

每次送入 ADP 的上下文默认只允许包含：

- `currentTask`
- `currentNode`
- `profileSummary`
- `retrievedKnowledge`
- `recentTurns`
- `safetyInstruction`

不得传入：

- 全量学习地图
- 全量错题本
- 全量历史笔记
- 数据库连接信息
- ADP 密钥
- 平台 Token

## 8. 推荐 SSE 事件口径

对前端的流式事件至少应覆盖：

- `tutor_delta`
- `checkpoint_prompt`
- `feedback_summary`
- `reroute_event`
- `done`

要求：

- `TutorAgent` 的讲解通过 SSE 交付
- `EvaluatorAgent` 的评分结果可结构化回写
- `MapPlannerAgent` 的重规划结果可作为事件回写

## 9. 审计与回滚约束

- 所有影响学习路线的动作都要能审计
- 所有知识发布动作都要能追溯到 `ValidationReport`
- 任何回滚都必须保留原因、目标版本和影响范围
- 后台必须可查看策略快照、重规划日志和异常记录
