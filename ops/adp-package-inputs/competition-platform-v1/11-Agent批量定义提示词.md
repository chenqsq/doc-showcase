# 提示词｜Agent 批量定义

请基于我已提供的 4 个输入包，为这个 ADP 应用先输出一份 `Agent 批量定义表`。  
这一步先不要写完整系统提示词，只输出 Agent 设计表，供我确认角色拆分。

默认要求：

- 优先保留 9 个业务 Agent
- 只有在模板强依赖主控时，才额外补一个轻量 `TeacherOrchestrator`
- 不允许删掉资料入库与策略后台相关 Agent
- 不允许把多个核心职责粗暴合并成单 Agent 问答器

请输出一张 Markdown 表，字段固定为：

| Agent | 角色定位 | 何时触发 | 主要输入 | 主要输出 | 结构化输出关键字段 | 工作流位置 | 推荐模型类型 | 知识库/工具依赖 | 不得承担 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

输出顺序固定为：

1. `StarterAgent`
2. `DiagnosisAgent`
3. `MapPlannerAgent`
4. `TutorAgent`
5. `EvaluatorAgent`
6. `ProfileAgent`
7. `NoteSynthAgent`
8. `IngestionAgent`
9. `StrategyAgent`
10. `TeacherOrchestrator`（仅当确有必要时追加）

输出后，请额外补一段 `角色拆分复核`，明确回答：

- 6 个页面分别由哪些 Agent 或工作流承接
- 学生主链是否完整覆盖“地图、诊断、闯关、评分、反馈、画像、笔记”
- 后台主链是否完整覆盖“资料入库、候选区、校验、发布/回滚、策略快照、审计”
- 是否有哪个 Agent 职责过大或过虚，如果有请主动收窄

禁止项：

- 不要直接写完整系统提示词
- 不要把 `LearningMap`、`KnowledgeRelease` 之类真状态改成模糊描述
- 不要建议“先只做一个聊天主控，其他以后再补”
