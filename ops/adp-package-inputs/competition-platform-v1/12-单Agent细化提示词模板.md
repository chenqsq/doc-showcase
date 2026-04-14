# 提示词模板｜单 Agent 细化

请基于我已提供的 4 个输入包，以及已经确认的 Agent 拆分方案，只为下面这个 Agent 生成完整设计：

`[在这里替换成 Agent 名，例如 TutorAgent]`

要求你输出 9 个部分，顺序固定：

## 1. 角色定位

- 这个 Agent 在整条主链或后台链中的唯一职责
- 它解决什么问题
- 它不解决什么问题

## 2. 触发条件 / 转交说明

- 什么时候应该交给它
- 上游通常是谁
- 下游通常是谁

## 3. 输入定义

请列出：

- 必要输入对象
- 可选输入对象
- 绝不应该依赖的输入

输入对象名必须优先复用既有契约，例如：

- `LearningSession`
- `LearningMap`
- `MapNode`
- `DiagnosticResult`
- `RerouteEvent`
- `CheckpointAttempt`
- `LearnerProfileSnapshot`
- `NoteBundle`
- `IngestionTask`
- `KnowledgePatch`
- `ValidationReport`
- `KnowledgeRelease`
- `StrategySnapshot`

## 4. 输出定义

请给出：

- 主要输出对象
- 最小结构化字段
- 哪些字段必须稳定输出

如果这个 Agent 会产生自然语言，也请同时给出结构化输出字段。

## 5. 硬边界

请明确：

- 它能改什么
- 它只能建议什么
- 它绝对不能持有什么真状态

## 6. 失败兜底

请给出：

- 典型失败场景
- 保底输出策略
- 应如何把失败交给上游或下游处理

## 7. 禁止项

至少覆盖：

- 不该伪造什么
- 不该越权做什么
- 不该输出什么模糊结果

## 8. 完整系统提示词

请直接写出一份可放进 ADP Agent 的系统提示词，要求：

- 中文
- 结构清晰
- 职责单一
- 风格与输入包 D 一致
- 不把业务真状态写进长期记忆

## 9. 转交描述

请额外生成一段简短的转交描述，适合放在 Multi-Agent 的 Agent 描述里。

额外要求：

- 如果当前 Agent 是 `TutorAgent`，要体现流式讲解与教学引导
- 如果当前 Agent 是 `EvaluatorAgent`，必须体现结构化评分
- 如果当前 Agent 是 `MapPlannerAgent`，必须体现重规划事件而不是自然语言建议
- 如果当前 Agent 是 `IngestionAgent`，必须体现“候选而非直发”
- 如果当前 Agent 是 `StrategyAgent`，必须体现影响域、审计和策略快照
- 除非我明确要求，不要新增新 Agent
